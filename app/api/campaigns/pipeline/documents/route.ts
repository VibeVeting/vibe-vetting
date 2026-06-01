import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { CampaignPipelineModel } from "@/lib/models/campaign-pipeline";
import { sendEmail } from "@/lib/services/email-service";

const DB_NAME = "vibe-vetting";

// Helper to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "No token provided" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  return { userId: payload.userId };
}

// GET: Get documents for a creator
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");

    if (!creatorId) {
      return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
    }

    const creator = await CampaignPipelineModel.findById(creatorId);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      documents: creator.documents.map((doc) => ({
        id: doc._id?.toString(),
        type: doc.type,
        name: doc.name,
        fileUrl: doc.fileUrl,
        status: doc.status,
        sentAt: doc.sentAt,
        viewedAt: doc.viewedAt,
        signedAt: doc.signedAt,
        signedFileUrl: doc.signedFileUrl,
        expiresAt: doc.expiresAt,
        notes: doc.notes,
      })),
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return NextResponse.json({ error: "Failed to get documents" }, { status: 500 });
  }
}

// POST: Document management actions
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { action, creatorId, documentId, data } = body;

    switch (action) {
      case "add_document": {
        // Add a new document
        if (!creatorId || !data?.type || !data?.name) {
          return NextResponse.json(
            { error: "Creator ID, document type, and name are required" },
            { status: 400 }
          );
        }

        const expiryDate = data.expiresInDays
          ? new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000)
          : undefined;

        const updatedCreator = await CampaignPipelineModel.addDocument(creatorId, {
          type: data.type,
          name: data.name,
          fileUrl: data.fileUrl,
          status: "pending",
          expiresAt: expiryDate,
          notes: data.notes,
        });

        return NextResponse.json({
          success: true,
          message: "Document added successfully",
          creator: updatedCreator,
        });
      }

      case "send_document": {
        // Send document to creator
        if (!creatorId || !documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const document = creator.documents.find((d) => d._id?.toString() === documentId);
        if (!document) {
          return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Update document status
        await CampaignPipelineModel.updateDocumentStatus(creatorId, documentId, "sent");

        // Send email notification
        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "contract_send",
          variables: {
            creatorName: creator.creatorName,
            campaignName: data?.campaignName || "Our Campaign",
            finalAmount: `$${creator.agreedPrice?.toLocaleString() || "TBD"}`,
            paymentTerms: creator.negotiation?.paymentTerms || "To be confirmed",
            deliverables:
              creator.negotiation?.deliverables
                ?.map((d) => `${d.quantity}x ${d.type}`)
                .join(", ") || "",
            timeline: data?.timeline || "To be confirmed",
            expiryDate: document.expiresAt?.toLocaleDateString() || "7 days",
            signLink: data?.signLink || document.fileUrl || "",
            senderName: data?.senderName || "The Team",
          },
        });

        // Update stage if this is a contract
        if (document.type === "contract" && creator.currentStage === "agreement_reached") {
          await CampaignPipelineModel.updateStage(creatorId, "contract_sent", "Contract sent");
        }

        return NextResponse.json({
          success: true,
          message: "Document sent successfully",
        });
      }

      case "mark_viewed": {
        // Mark document as viewed
        if (!creatorId || !documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        await CampaignPipelineModel.updateDocumentStatus(creatorId, documentId, "viewed");

        return NextResponse.json({
          success: true,
          message: "Document marked as viewed",
        });
      }

      case "sign_document": {
        // Mark document as signed
        if (!creatorId || !documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        await CampaignPipelineModel.updateDocumentStatus(
          creatorId,
          documentId,
          "signed",
          data?.signedFileUrl
        );

        // Check if this is the contract and update stage
        const document = creator.documents.find((d) => d._id?.toString() === documentId);
        if (document?.type === "contract" && creator.currentStage === "contract_sent") {
          await CampaignPipelineModel.updateStage(
            creatorId,
            "contract_signed",
            "Contract signed by creator"
          );
        }

        return NextResponse.json({
          success: true,
          message: "Document signed successfully",
        });
      }

      case "reject_document": {
        // Mark document as rejected
        if (!creatorId || !documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        await CampaignPipelineModel.updateDocumentStatus(creatorId, documentId, "rejected");

        return NextResponse.json({
          success: true,
          message: "Document rejected",
        });
      }

      case "send_reminder": {
        // Send reminder for pending documents
        if (!creatorId || !documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const document = creator.documents.find((d) => d._id?.toString() === documentId);
        if (!document) {
          return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "contract_reminder",
          variables: {
            creatorName: creator.creatorName,
            campaignName: data?.campaignName || "Our Campaign",
            expiryDate: document.expiresAt?.toLocaleDateString() || "Soon",
            signLink: data?.signLink || document.fileUrl || "",
            senderName: data?.senderName || "The Team",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Reminder sent successfully",
        });
      }

      case "generate_contract": {
        // Generate contract document (placeholder - in real app, use document generation service)
        if (!creatorId) {
          return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // In a real implementation, this would:
        // 1. Generate PDF using a service like PDFKit, Puppeteer, or a contract management API
        // 2. Upload to cloud storage (S3, GCS, etc.)
        // 3. Return the file URL

        const contractData = {
          creatorName: creator.creatorName,
          creatorEmail: creator.creatorEmail,
          agreedPrice: creator.agreedPrice,
          currency: creator.negotiation?.currency || "INR",
          paymentTerms: creator.negotiation?.paymentTerms,
          deliverables: creator.negotiation?.deliverables,
          startDate: data?.startDate || new Date().toISOString(),
          endDate: data?.endDate,
          brandName: data?.brandName || "Company",
          campaignName: data?.campaignName || "Campaign",
        };

        // Mock contract URL - in production, this would be a real generated document
        const contractUrl = `/api/campaigns/pipeline/documents/preview?type=contract&creatorId=${creatorId}`;

        // Add document to creator
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await CampaignPipelineModel.addDocument(creatorId, {
          type: "contract",
          name: `Collaboration Agreement - ${creator.creatorName}`,
          fileUrl: contractUrl,
          status: "pending",
          expiresAt: expiryDate,
          notes: `Generated on ${new Date().toLocaleDateString()}`,
        });

        return NextResponse.json({
          success: true,
          message: "Contract generated",
          contractUrl,
          contractData,
        });
      }

      case "generate_invoice": {
        // Generate invoice document
        if (!creatorId) {
          return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const invoiceData = {
          invoiceNumber: `INV-${Date.now()}`,
          creatorName: creator.creatorName,
          creatorEmail: creator.creatorEmail,
          amount: creator.agreedPrice,
          currency: creator.negotiation?.currency || "INR",
          paymentTerms: creator.negotiation?.paymentTerms,
          deliverables: creator.negotiation?.deliverables,
          brandName: data?.brandName || "Company",
          campaignName: data?.campaignName || "Campaign",
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        const invoiceUrl = `/api/campaigns/pipeline/documents/preview?type=invoice&creatorId=${creatorId}`;

        await CampaignPipelineModel.addDocument(creatorId, {
          type: "invoice",
          name: `Invoice ${invoiceData.invoiceNumber}`,
          fileUrl: invoiceUrl,
          status: "pending",
          notes: `Generated on ${new Date().toLocaleDateString()}`,
        });

        return NextResponse.json({
          success: true,
          message: "Invoice generated",
          invoiceUrl,
          invoiceData,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Document action error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

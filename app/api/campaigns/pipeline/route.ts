import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { CampaignPipelineModel, PipelineStage } from "@/lib/models/campaign-pipeline";
import { sendEmail, sendBulkEmails, generateEmailPreview } from "@/lib/services/email-service";

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

// GET: Get all creators in a campaign pipeline or pipeline summary
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const stage = searchParams.get("stage") as PipelineStage | null;
    const summaryOnly = searchParams.get("summary") === "true";

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // Return summary only
    if (summaryOnly) {
      const summary = await CampaignPipelineModel.getPipelineSummary(campaignId);
      return NextResponse.json({ success: true, summary });
    }

    // Get creators by stage or all
    let creators;
    if (stage) {
      creators = await CampaignPipelineModel.findByStage(campaignId, stage);
    } else {
      creators = await CampaignPipelineModel.findByCampaign(campaignId);
    }

    // Also get summary
    const summary = await CampaignPipelineModel.getPipelineSummary(campaignId);

    return NextResponse.json({
      success: true,
      creators: creators.map((c) => ({
        id: c._id?.toString(),
        creatorId: c.creatorId,
        creatorName: c.creatorName,
        creatorEmail: c.creatorEmail,
        creatorHandle: c.creatorHandle,
        platform: c.platform,
        followers: c.followers,
        engagementRate: c.engagementRate,
        currentStage: c.currentStage,
        stageHistory: c.stageHistory,
        outreachEmails: c.outreachEmails,
        lastContactedAt: c.lastContactedAt,
        followUpCount: c.followUpCount,
        sentimentAnalysis: c.sentimentAnalysis,
        negotiation: c.negotiation,
        documents: c.documents,
        agreedPrice: c.agreedPrice,
        agreedDeliverables: c.agreedDeliverables,
        review: c.review,
        totalCost: c.totalCost,
        totalDays: c.totalDays,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      summary,
    });
  } catch (error) {
    console.error("Get pipeline error:", error);
    return NextResponse.json({ error: "Failed to get pipeline data" }, { status: 500 });
  }
}

// POST: Add creators to campaign pipeline or perform actions
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { action, campaignId, creators, creatorId, data } = body;

    switch (action) {
      case "add_creators": {
        // Add multiple creators to campaign
        if (!campaignId || !creators || !Array.isArray(creators)) {
          return NextResponse.json(
            { error: "Campaign ID and creators array are required" },
            { status: 400 }
          );
        }

        const addedCreators = await CampaignPipelineModel.bulkAddCreators(campaignId, creators);
        return NextResponse.json({
          success: true,
          message: `Added ${addedCreators.length} creators to pipeline`,
          creators: addedCreators,
        });
      }

      case "send_outreach": {
        // Send initial outreach emails to all creators in outreach stage
        if (!campaignId) {
          return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
        }

        const creatorsToContact = await CampaignPipelineModel.findByStage(campaignId, "outreach");
        const emailsToSend = creatorsToContact.map((creator) => ({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "initial_outreach" as const,
          variables: {
            creatorName: creator.creatorName,
            brandName: data?.brandName || "Our Brand",
            niche: data?.niche || "your niche",
            brandValues: data?.brandValues || "quality and authenticity",
            campaignName: data?.campaignName || "Our Campaign",
            deliverables: data?.deliverables || "• 1 Instagram Post\n• 2 Stories",
            budgetRange: data?.budgetRange || "$500 - $2,000",
            senderName: data?.senderName || "The Team",
            responseLink: data?.responseLink || "",
          },
        }));

        const results = await sendBulkEmails(emailsToSend);

        // Update each creator with email record and move to awaiting_response
        for (let i = 0; i < creatorsToContact.length; i++) {
          const creator = creatorsToContact[i];
          const emailResult = results.results[i];

          if (emailResult.success) {
            await CampaignPipelineModel.addOutreachEmail(creator._id!.toString(), {
              type: "initial",
              subject: `Exciting Collaboration Opportunity with ${data?.brandName || "Our Brand"}`,
              body: emailsToSend[i].variables.deliverables,
              sentAt: new Date(),
              isOpened: false,
              isReplied: false,
            });

            await CampaignPipelineModel.updateStage(
              creator._id!.toString(),
              "awaiting_response",
              "Initial outreach email sent"
            );
          }
        }

        return NextResponse.json({
          success: true,
          message: `Sent ${results.successCount} emails, ${results.failCount} failed`,
          results,
        });
      }

      case "send_follow_up": {
        // Send follow-up emails
        if (!campaignId) {
          return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
        }

        const awaitingCreators = await CampaignPipelineModel.findByStage(
          campaignId,
          "awaiting_response"
        );
        const creatorsNeedingFollowUp = awaitingCreators.filter((c) => {
          const lastContact = c.lastContactedAt || c.createdAt;
          const daysSinceContact = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceContact >= 3 && c.followUpCount < 3;
        });

        const emailsToSend = creatorsNeedingFollowUp.map((creator) => {
          const followUpNumber = creator.followUpCount + 1;
          const emailType =
            followUpNumber === 1
              ? "follow_up_1"
              : followUpNumber === 2
              ? "follow_up_2"
              : "follow_up_3";

          return {
            to: creator.creatorEmail,
            toName: creator.creatorName,
            type: emailType as "follow_up_1" | "follow_up_2" | "follow_up_3",
            variables: {
              creatorName: creator.creatorName,
              brandName: data?.brandName || "Our Brand",
              campaignName: data?.campaignName || "Our Campaign",
              senderName: data?.senderName || "The Team",
            },
          };
        });

        const results = await sendBulkEmails(emailsToSend);

        // Update creators
        for (let i = 0; i < creatorsNeedingFollowUp.length; i++) {
          const creator = creatorsNeedingFollowUp[i];
          const emailResult = results.results[i];

          if (emailResult.success) {
            await CampaignPipelineModel.addOutreachEmail(creator._id!.toString(), {
              type: "follow_up",
              subject: emailsToSend[i].variables.campaignName,
              body: `Follow-up ${creator.followUpCount + 1}`,
              sentAt: new Date(),
              isOpened: false,
              isReplied: false,
            });

            // Mark as no_response after 3 follow-ups
            if (creator.followUpCount + 1 >= 3) {
              await CampaignPipelineModel.updateStage(
                creator._id!.toString(),
                "no_response",
                "No response after 3 follow-ups"
              );
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Sent ${results.successCount} follow-up emails`,
          results,
        });
      }

      case "update_stage": {
        // Update a single creator's stage
        if (!creatorId || !data?.stage) {
          return NextResponse.json(
            { error: "Creator ID and new stage are required" },
            { status: 400 }
          );
        }

        const updatedCreator = await CampaignPipelineModel.updateStage(
          creatorId,
          data.stage,
          data.notes
        );

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "record_response": {
        // Record a creator's email response
        if (!creatorId || !data?.emailId || !data?.response) {
          return NextResponse.json(
            { error: "Creator ID, email ID, and response are required" },
            { status: 400 }
          );
        }

        const updatedCreator = await CampaignPipelineModel.recordEmailResponse(
          creatorId,
          data.emailId,
          data.response
        );

        // Move to response_received stage
        if (updatedCreator) {
          await CampaignPipelineModel.updateStage(
            creatorId,
            "response_received",
            "Creator responded to outreach"
          );
        }

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "start_negotiation": {
        // Start price negotiation
        if (!creatorId || !data?.initialOffer || !data?.deliverables) {
          return NextResponse.json(
            { error: "Creator ID, initial offer, and deliverables are required" },
            { status: 400 }
          );
        }

        const updatedCreator = await CampaignPipelineModel.startNegotiation(
          creatorId,
          data.initialOffer,
          data.deliverables,
          data.currency || "USD"
        );

        // Send negotiation email
        if (updatedCreator) {
          await sendEmail({
            to: updatedCreator.creatorEmail,
            toName: updatedCreator.creatorName,
            type: "negotiation_offer",
            variables: {
              creatorName: updatedCreator.creatorName,
              brandName: data.brandName || "Our Brand",
              campaignName: data.campaignName || "Our Campaign",
              deliverables: data.deliverables.map((d: any) => `• ${d.quantity}x ${d.type}`).join("\n"),
              offerAmount: `$${data.initialOffer.toLocaleString()}`,
              paymentTerms: data.paymentTerms || "50% upfront, 50% on completion",
              timeline: data.timeline || "2 weeks from contract signing",
              senderName: data.senderName || "The Team",
              acceptLink: data.acceptLink || "",
              negotiateLink: data.negotiateLink || "",
            },
          });

          await CampaignPipelineModel.addOutreachEmail(creatorId, {
            type: "negotiation",
            subject: "Collaboration Terms",
            body: `Initial offer: $${data.initialOffer}`,
            sentAt: new Date(),
            isOpened: false,
            isReplied: false,
          });
        }

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "counter_offer": {
        // Add a counter offer
        if (!creatorId || !data?.amount || !data?.from) {
          return NextResponse.json(
            { error: "Creator ID, amount, and from (brand/creator) are required" },
            { status: 400 }
          );
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const updatedCreator = await CampaignPipelineModel.addCounterOffer(creatorId, {
          from: data.from,
          amount: data.amount,
          message: data.message || "",
          sentAt: new Date(),
        });

        // If brand is countering, send email
        if (data.from === "brand" && updatedCreator) {
          const previousAmount =
            creator.negotiation?.counterOffers?.length
              ? creator.negotiation.counterOffers[creator.negotiation.counterOffers.length - 1].amount
              : creator.negotiation?.initialOffer || 0;

          await sendEmail({
            to: updatedCreator.creatorEmail,
            toName: updatedCreator.creatorName,
            type: "negotiation_counter",
            variables: {
              creatorName: updatedCreator.creatorName,
              previousAmount: `$${previousAmount.toLocaleString()}`,
              newAmount: `$${data.amount.toLocaleString()}`,
              notes: data.message || "We've adjusted our offer based on your feedback.",
              senderName: data.senderName || "The Team",
            },
          });
        }

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "finalize_negotiation": {
        // Finalize negotiation
        if (!creatorId || data?.finalPrice === undefined || data?.accepted === undefined) {
          return NextResponse.json(
            { error: "Creator ID, final price, and accepted status are required" },
            { status: 400 }
          );
        }

        const updatedCreator = await CampaignPipelineModel.finalizeNegotiation(
          creatorId,
          data.finalPrice,
          data.paymentTerms || "50% upfront, 50% on completion",
          data.accepted
        );

        // Send confirmation email if accepted
        if (data.accepted && updatedCreator) {
          await sendEmail({
            to: updatedCreator.creatorEmail,
            toName: updatedCreator.creatorName,
            type: "agreement_confirmation",
            variables: {
              creatorName: updatedCreator.creatorName,
              brandName: data.brandName || "Our Brand",
              campaignName: data.campaignName || "Our Campaign",
              finalAmount: `$${data.finalPrice.toLocaleString()}`,
              deliverables:
                updatedCreator.negotiation?.deliverables
                  ?.map((d) => `• ${d.quantity}x ${d.type}`)
                  .join("\n") || "",
              timeline: data.timeline || "To be confirmed",
              senderName: data.senderName || "The Team",
            },
          });
        }

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "send_contract": {
        // Send contract for signing
        if (!creatorId || !data?.documentUrl) {
          return NextResponse.json(
            { error: "Creator ID and document URL are required" },
            { status: 400 }
          );
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7); // 7 days to sign

        await CampaignPipelineModel.addDocument(creatorId, {
          type: "contract",
          name: data.documentName || "Collaboration Contract",
          fileUrl: data.documentUrl,
          status: "sent",
          sentAt: new Date(),
          expiresAt: expiryDate,
        });

        await CampaignPipelineModel.updateStage(creatorId, "contract_sent", "Contract sent for signing");

        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "contract_send",
          variables: {
            creatorName: creator.creatorName,
            campaignName: data.campaignName || "Our Campaign",
            finalAmount: `$${creator.agreedPrice?.toLocaleString() || "TBD"}`,
            paymentTerms: creator.negotiation?.paymentTerms || "To be confirmed",
            deliverables:
              creator.negotiation?.deliverables?.map((d) => `${d.quantity}x ${d.type}`).join(", ") ||
              "",
            timeline: data.timeline || "To be confirmed",
            expiryDate: expiryDate.toLocaleDateString(),
            signLink: data.signLink || data.documentUrl,
            senderName: data.senderName || "The Team",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Contract sent successfully",
        });
      }

      case "sign_contract": {
        // Mark contract as signed
        if (!creatorId || !data?.documentId) {
          return NextResponse.json(
            { error: "Creator ID and document ID are required" },
            { status: 400 }
          );
        }

        await CampaignPipelineModel.updateDocumentStatus(
          creatorId,
          data.documentId,
          "signed",
          data.signedFileUrl
        );

        await CampaignPipelineModel.updateStage(creatorId, "contract_signed", "Contract signed by creator");

        return NextResponse.json({
          success: true,
          message: "Contract marked as signed",
        });
      }

      case "start_campaign": {
        // Move to in_progress
        if (!creatorId) {
          return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        await CampaignPipelineModel.updateStage(creatorId, "in_progress", "Campaign started");

        // Send campaign brief
        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "campaign_brief",
          variables: {
            creatorName: creator.creatorName,
            campaignName: data?.campaignName || "Our Campaign",
            campaignDescription: data?.campaignDescription || "Details to follow",
            deliverables:
              creator.negotiation?.deliverables?.map((d) => `• ${d.quantity}x ${d.type}: ${d.description}`).join("\n") ||
              "",
            keyMessages: data?.keyMessages || "• Key message 1\n• Key message 2",
            dos: data?.dos || "• Be authentic\n• Tag our brand",
            donts: data?.donts || "• No competitor mentions",
            hashtags: data?.hashtags || "#ad #sponsored",
            timeline: data?.timeline || "To be confirmed",
            senderName: data?.senderName || "The Team",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Campaign started and brief sent",
        });
      }

      case "complete_campaign": {
        // Mark campaign as completed and request review
        if (!creatorId) {
          return NextResponse.json({ error: "Creator ID is required" }, { status: 400 });
        }

        const creator = await CampaignPipelineModel.findById(creatorId);
        if (!creator) {
          return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        await CampaignPipelineModel.updateStage(creatorId, "completed", "Campaign completed");

        // Send thank you and review request
        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "thank_you",
          variables: {
            creatorName: creator.creatorName,
            brandName: data?.brandName || "Our Brand",
            campaignName: data?.campaignName || "Our Campaign",
            results: data?.results || "Amazing engagement!",
            senderName: data?.senderName || "The Team",
          },
        });

        await sendEmail({
          to: creator.creatorEmail,
          toName: creator.creatorName,
          type: "review_request",
          variables: {
            creatorName: creator.creatorName,
            brandName: data?.brandName || "Our Brand",
            campaignName: data?.campaignName || "Our Campaign",
            reviewLink: data?.reviewLink || "",
            senderName: data?.senderName || "The Team",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Campaign completed and review requested",
        });
      }

      case "add_review": {
        // Add brand's review of creator
        if (!creatorId || !data?.review) {
          return NextResponse.json(
            { error: "Creator ID and review data are required" },
            { status: 400 }
          );
        }

        const updatedCreator = await CampaignPipelineModel.addReview(creatorId, {
          ...data.review,
          reviewedAt: new Date(),
          reviewedBy: auth.userId!,
        });

        return NextResponse.json({
          success: true,
          creator: updatedCreator,
        });
      }

      case "preview_email": {
        // Preview an email template
        if (!data?.emailType || !data?.variables) {
          return NextResponse.json(
            { error: "Email type and variables are required" },
            { status: 400 }
          );
        }

        const preview = generateEmailPreview(data.emailType, data.variables);
        return NextResponse.json({
          success: true,
          preview,
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Pipeline action error:", error);
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 });
  }
}

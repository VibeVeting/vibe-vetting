import { NextRequest, NextResponse } from "next/server";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { NotificationModel } from "@/lib/models/notification";
import { verifyToken } from "@/lib/auth";

// GET - Get single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const application = await BarterApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if user is the creator or the brand
    if (application.creatorId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    return NextResponse.json({ 
      application: {
        ...application,
        _id: application._id?.toString(),
        offerId: application.offerId.toString(),
        creatorId: application.creatorId.toString(),
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update application (submit content, update shipping address)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const application = await BarterApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if user is the creator
    if (application.creatorId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { action, contentLink, shippingAddress } = body;

    let updatedApplication;

    if (action === 'submit_content') {
      if (!contentLink) {
        return NextResponse.json({ error: "Content link is required" }, { status: 400 });
      }
      
      // Check if application is approved
      if (!['approved', 'content_pending', 'revision_requested'].includes(application.status)) {
        return NextResponse.json({ error: "Cannot submit content for this application" }, { status: 400 });
      }

      updatedApplication = await BarterApplicationModel.submitContent(id, contentLink);

      // Send notification to the company about the content submission
      try {
        const offer = await BarterOfferModel.findById(application.offerId.toString());
        if (offer) {
          await NotificationModel.create(offer.brandId.toString(), {
            title: `Content Submitted by ${application.creatorName}`,
            body: `${application.creatorName} has submitted content for "${offer.productName}". Review and approve to complete the collaboration.`,
            type: 'content',
            metadata: {
              applicationId: application._id?.toString(),
              offerId: offer._id?.toString(),
              offerName: offer.productName,
              creatorName: application.creatorName,
              contentLink: contentLink,
              avatar: application.creatorName.charAt(0).toUpperCase(),
              actionUrl: '/barter-company-dashboard',
              actionLabel: 'Review Content',
            },
          });
        }
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Don't fail the content submission if notification fails
      }
    } else if (action === 'update_shipping') {
      if (!shippingAddress) {
        return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
      }

      updatedApplication = await BarterApplicationModel.updateShippingAddress(id, shippingAddress);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Application updated successfully",
      application: updatedApplication ? {
        ...updatedApplication,
        _id: updatedApplication._id?.toString(),
        offerId: updatedApplication.offerId.toString(),
        creatorId: updatedApplication.creatorId.toString(),
      } : null
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Withdraw application
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const application = await BarterApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if user is the creator
    if (application.creatorId.toString() !== payload.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return NextResponse.json({ error: "Cannot withdraw this application" }, { status: 400 });
    }

    await BarterApplicationModel.delete(id);

    return NextResponse.json({ message: "Application withdrawn successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

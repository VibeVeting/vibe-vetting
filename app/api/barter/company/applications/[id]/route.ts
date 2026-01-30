import { NextRequest, NextResponse } from "next/server";
import { BarterApplicationModel, ApplicationStatus } from "@/lib/models/barter-application";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { verifyToken } from "@/lib/auth";

// GET - Get specific application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const application = await BarterApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the application is for one of company's offers
    const offer = await BarterOfferModel.findById(application.offerId.toString());
    if (!offer || offer.brandId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized to view this application" },
        { status: 403 }
      );
    }

    return NextResponse.json({ 
      application,
      offer 
    });
  } catch (error) {
    console.error("Get application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update application (approve, reject, request revision, mark shipped, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const application = await BarterApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify the application is for one of company's offers
    const offer = await BarterOfferModel.findById(application.offerId.toString());
    if (!offer || offer.brandId.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "Not authorized to update this application" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, note, trackingNumber, feedback } = body;

    let updatedApplication;

    switch (action) {
      case 'approve':
        // Approve application and set to content_pending
        updatedApplication = await BarterApplicationModel.updateStatus(id, 'approved', note);
        // Then immediately move to content_pending
        if (updatedApplication) {
          updatedApplication = await BarterApplicationModel.updateStatus(id, 'content_pending', 'Product will be shipped soon');
        }
        // Increment filled slots on the offer
        await BarterOfferModel.incrementFilledSlots(offer._id!.toString());
        break;

      case 'reject':
        updatedApplication = await BarterApplicationModel.updateStatus(id, 'rejected', note || 'Application not selected');
        break;

      case 'request_revision':
        updatedApplication = await BarterApplicationModel.updateStatus(id, 'revision_requested', feedback);
        break;

      case 'approve_content':
        updatedApplication = await BarterApplicationModel.updateStatus(id, 'completed', 'Content approved! Thank you for the collaboration.');
        break;

      case 'ship':
        if (!trackingNumber) {
          return NextResponse.json(
            { error: "Tracking number is required" },
            { status: 400 }
          );
        }
        updatedApplication = await BarterApplicationModel.markShipped(id, trackingNumber);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message: `Application ${action}d successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

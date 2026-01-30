import { NextRequest, NextResponse } from "next/server";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterUserModel } from "@/lib/models/barter-user";
import { NotificationModel } from "@/lib/models/notification";
import { verifyToken } from "@/lib/auth";

// GET - Get all applications for the current user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let applications = await BarterApplicationModel.findByCreator(payload.userId);

    // Filter by status if provided
    if (status && status !== 'all') {
      applications = applications.filter(a => a.status === status);
    }

    // Fetch offer details for each application
    const applicationsWithOffers = await Promise.all(
      applications.map(async (app) => {
        const offer = await BarterOfferModel.findById(app.offerId.toString());
        return {
          ...app,
          _id: app._id?.toString(),
          offerId: app.offerId.toString(),
          creatorId: app.creatorId.toString(),
          offer: offer ? {
            ...offer,
            _id: offer._id?.toString(),
            brandId: offer.brandId.toString(),
          } : null,
        };
      })
    );

    return NextResponse.json({ applications: applicationsWithOffers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Apply to an offer
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only barter creators can apply
    if (payload.userType !== 'barter_creator') {
      return NextResponse.json({ error: "Only creators can apply" }, { status: 403 });
    }

    const body = await request.json();
    const { offerId, applicationMessage } = body;

    if (!offerId) {
      return NextResponse.json({ error: "Offer ID is required" }, { status: 400 });
    }

    // Check if offer exists and is active
    const offer = await BarterOfferModel.findById(offerId);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== 'active') {
      return NextResponse.json({ error: "Offer is no longer active" }, { status: 400 });
    }

    if (offer.filledSlots >= offer.totalSlots) {
      return NextResponse.json({ error: "No slots available" }, { status: 400 });
    }

    if (new Date(offer.deadline) < new Date()) {
      return NextResponse.json({ error: "Offer deadline has passed" }, { status: 400 });
    }

    // Check if already applied
    const existingApplication = await BarterApplicationModel.findByOfferAndCreator(offerId, payload.userId);
    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied to this offer" }, { status: 400 });
    }

    // Get creator details
    const creator = await BarterUserModel.findById(payload.userId);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Create application
    const application = await BarterApplicationModel.create({
      offerId: offerId as any,
      creatorId: payload.userId as any,
      creatorName: creator.name,
      creatorEmail: creator.email,
      creatorNiche: creator.creatorProfile.niche,
      creatorFollowerCount: creator.creatorProfile.followerCount,
      creatorPrimaryPlatform: creator.creatorProfile.primaryPlatform,
      creatorSocialHandles: creator.creatorProfile.socialHandles,
      applicationMessage,
    });

    // Send notification to the company about the new application
    try {
      await NotificationModel.create(offer.brandId.toString(), {
        title: `New Application from ${creator.name}`,
        body: `${creator.name} (${creator.creatorProfile.followerCount} followers) has applied to your "${offer.productName}" offer.`,
        type: 'application',
        metadata: {
          applicationId: application._id?.toString(),
          offerId: offer._id?.toString(),
          offerName: offer.productName,
          creatorName: creator.name,
          avatar: creator.name.charAt(0).toUpperCase(),
          actionUrl: '/barter-company-dashboard',
          actionLabel: 'View Application',
        },
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Don't fail the application submission if notification fails
    }

    return NextResponse.json({ 
      message: "Application submitted successfully",
      application: {
        ...application,
        _id: application._id?.toString(),
        offerId: application.offerId.toString(),
        creatorId: application.creatorId.toString(),
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating application:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

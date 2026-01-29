import { NextRequest, NextResponse } from "next/server";
import { BarterUserModel } from "@/lib/models/barter-user";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { verifyToken } from "@/lib/auth";

// GET - Get creator profile and stats
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

    if (payload.userType !== 'barter_creator') {
      return NextResponse.json({ error: "Not a barter creator" }, { status: 403 });
    }

    const creator = await BarterUserModel.findById(payload.userId);
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Get application stats
    const applications = await BarterApplicationModel.findByCreator(payload.userId);
    
    // Calculate total product value earned
    let totalEarned = 0;
    for (const app of applications) {
      if (['completed', 'shipped'].includes(app.status)) {
        const offer = await BarterOfferModel.findById(app.offerId.toString());
        if (offer) {
          totalEarned += offer.productValue;
        }
      }
    }

    const stats = {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      approved: applications.filter(a => ['approved', 'content_pending'].includes(a.status)).length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      completed: applications.filter(a => ['completed', 'shipped'].includes(a.status)).length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      totalEarned,
    };

    return NextResponse.json({ 
      profile: {
        id: creator._id?.toString(),
        name: creator.name,
        email: creator.email,
        creatorProfile: creator.creatorProfile,
        createdAt: creator.createdAt,
      },
      stats,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching creator profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update creator profile
export async function PUT(request: NextRequest) {
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

    if (payload.userType !== 'barter_creator') {
      return NextResponse.json({ error: "Not a barter creator" }, { status: 403 });
    }

    const body = await request.json();
    const { name, creatorProfile } = body;

    const updateData: Record<string, any> = {};
    
    if (name) {
      updateData.name = name;
    }

    if (creatorProfile) {
      // Merge with existing profile
      const creator = await BarterUserModel.findById(payload.userId);
      if (creator) {
        updateData.creatorProfile = {
          ...creator.creatorProfile,
          ...creatorProfile,
          socialHandles: {
            ...creator.creatorProfile.socialHandles,
            ...(creatorProfile.socialHandles || {}),
          },
        };
      }
    }

    const updatedCreator = await BarterUserModel.update(payload.userId, updateData);

    return NextResponse.json({ 
      message: "Profile updated successfully",
      profile: updatedCreator ? {
        id: updatedCreator._id?.toString(),
        name: updatedCreator.name,
        email: updatedCreator.email,
        creatorProfile: updatedCreator.creatorProfile,
      } : null,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating creator profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

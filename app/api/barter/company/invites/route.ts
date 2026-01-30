import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "vibe-vetting";

// POST - Bulk invite creators to a barter offer
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { creatorIds, offerId, message } = body;

    if (!creatorIds || !Array.isArray(creatorIds) || creatorIds.length === 0) {
      return NextResponse.json(
        { error: "At least one creator must be selected" },
        { status: 400 }
      );
    }

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Verify the offer belongs to this company
    const offer = await db.collection("barter_offers").findOne({
      _id: new ObjectId(offerId),
      companyId: decoded.userId,
    });

    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found or not authorized" },
        { status: 404 }
      );
    }

    // Get creator details
    const creators = await db.collection("barter_users").find({
      _id: { $in: creatorIds.map((id: string) => new ObjectId(id)) }
    }).toArray();

    if (creators.length === 0) {
      return NextResponse.json(
        { error: "No valid creators found" },
        { status: 400 }
      );
    }

    // Create invitations
    const invitations = creators.map(creator => ({
      offerId: new ObjectId(offerId),
      creatorId: creator._id!.toString(),
      companyId: decoded.userId,
      creatorName: creator.name,
      creatorEmail: creator.email,
      creatorNiche: creator.creatorProfile?.niche || 'General',
      creatorFollowerCount: creator.creatorProfile?.followerCount || '0',
      creatorPrimaryPlatform: creator.creatorProfile?.primaryPlatform || 'instagram',
      creatorSocialHandles: creator.creatorProfile?.socialHandles || {},
      message: message || `You're invited to collaborate on ${offer.productName}!`,
      status: 'invited', // invited, accepted, declined
      offer: {
        productName: offer.productName,
        productValue: offer.productValue,
        productImage: offer.productImage,
        contentType: offer.contentType,
        productCategory: offer.productCategory,
      },
      invitedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Check for existing invitations to avoid duplicates
    const existingInvites = await db.collection("barter_invitations").find({
      offerId: new ObjectId(offerId),
      creatorId: { $in: creatorIds }
    }).toArray();

    const existingCreatorIds = new Set(existingInvites.map(inv => inv.creatorId));
    const newInvitations = invitations.filter(inv => !existingCreatorIds.has(inv.creatorId));

    if (newInvitations.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All selected creators have already been invited to this offer",
        invitedCount: 0,
        skippedCount: creatorIds.length,
      });
    }

    // Insert new invitations
    const result = await db.collection("barter_invitations").insertMany(newInvitations);

    // Create notifications for invited creators
    const notifications = newInvitations.map(inv => ({
      userId: inv.creatorId,
      userType: 'barter_creator',
      type: 'barter_invite',
      title: 'New Barter Invitation!',
      message: `You've been invited to collaborate on ${offer.productName} worth ₹${offer.productValue}`,
      data: {
        offerId: offerId,
        invitationId: inv.creatorId,
      },
      read: false,
      createdAt: new Date(),
    }));

    await db.collection("notifications").insertMany(notifications);

    return NextResponse.json({
      success: true,
      message: `Successfully invited ${newInvitations.length} creators`,
      invitedCount: newInvitations.length,
      skippedCount: creatorIds.length - newInvitations.length,
    });
  } catch (error) {
    console.error("Bulk invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get all invitations for a company
export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const query: Record<string, unknown> = { companyId: decoded.userId };
    if (offerId) {
      query.offerId = new ObjectId(offerId);
    }

    const invitations = await db.collection("barter_invitations")
      .find(query)
      .sort({ invitedAt: -1 })
      .toArray();

    return NextResponse.json({
      invitations: invitations.map(inv => ({
        ...inv,
        _id: inv._id.toString(),
        offerId: inv.offerId.toString(),
      })),
    });
  } catch (error) {
    console.error("Get invitations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

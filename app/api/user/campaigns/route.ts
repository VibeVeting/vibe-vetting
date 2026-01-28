import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";
const SESSIONS_COLLECTION = "sessions";

// Campaign interface
interface Campaign {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description: string;
  status: "active" | "completed" | "draft";
  budget: number;
  startDate: Date;
  endDate?: Date;
  // Platform & Reach
  industry?: string;
  platforms?: string[];
  followerRange?: string;
  engagementRate?: string;
  // Audience Demographics
  audienceAge?: string[];
  audienceGender?: string;
  audienceLocation?: string[];
  // Content Requirements
  contentType?: string[];
  contentStyle?: string;
  postingFrequency?: string;
  deliverables?: string;
  // Brand Safety
  minTrustScore?: string;
  maxRiskLevel?: string;
  brandValues?: string[];
  excludeCategories?: string[];
  // Counts
  creatorsCount: number;
  matchedCreators: number;
  createdAt: Date;
  updatedAt: Date;
}

// Campaign creator interface for counting
interface CampaignCreator {
  _id?: ObjectId;
  campaignId: ObjectId;
  currentStage: string;
}

async function getCampaignsCollection(): Promise<Collection<Campaign>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<Campaign>("campaigns");
}

async function getCampaignCreatorsCollection(): Promise<Collection<CampaignCreator>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<CampaignCreator>("campaign_creators");
}

async function getSessionsCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(SESSIONS_COLLECTION);
}

// Get user ID from token with session validation, falls back to token-only if session not found
async function getUserIdFromToken(request: NextRequest): Promise<{ userId: string | null; error?: NextResponse }> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { userId: null, error: NextResponse.json({ error: "No token provided" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return { userId: null, error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  // Try to validate session, but allow if token is valid (for backwards compatibility)
  const sessions = await getSessionsCollection();
  const session = await sessions.findOne({ userId: new ObjectId(payload.userId), jti: payload.jti });
  if (session) {
    // Update last active time
    await sessions.updateOne({ _id: session._id }, { $set: { lastActive: new Date() } });
  }

  return { userId: payload.userId };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await getUserIdFromToken(request);
    if (auth.error) return auth.error;

    const collection = await getCampaignsCollection();
    const creatorsCollection = await getCampaignCreatorsCollection();
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const campaignId = searchParams.get("id"); // Single campaign fetch

    // If fetching a single campaign by ID
    if (campaignId) {
      const campaign = await collection.findOne({ 
        _id: new ObjectId(campaignId),
        userId: new ObjectId(auth.userId!) 
      });

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      // Get real creator counts from campaign_creators collection
      const totalCreators = await creatorsCollection.countDocuments({ 
        campaignId: new ObjectId(campaignId) 
      });
      
      const matchedCreators = await creatorsCollection.countDocuments({ 
        campaignId: new ObjectId(campaignId),
        currentStage: { $nin: ["declined", "no_response"] }
      });

      return NextResponse.json({
        campaign: {
          id: campaign._id?.toString(),
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          budget: campaign.budget,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          // Platform & Reach
          industry: campaign.industry,
          platforms: campaign.platforms,
          followerRange: campaign.followerRange,
          engagementRate: campaign.engagementRate,
          // Audience Demographics
          audienceAge: campaign.audienceAge,
          audienceGender: campaign.audienceGender,
          audienceLocation: campaign.audienceLocation,
          // Content Requirements
          contentType: campaign.contentType,
          contentStyle: campaign.contentStyle,
          postingFrequency: campaign.postingFrequency,
          deliverables: campaign.deliverables,
          // Brand Safety
          minTrustScore: campaign.minTrustScore,
          maxRiskLevel: campaign.maxRiskLevel,
          brandValues: campaign.brandValues,
          excludeCategories: campaign.excludeCategories,
          // Counts
          creatorsCount: totalCreators,
          matchedCreators: matchedCreators,
          createdAt: campaign.createdAt,
        },
      });
    }

    // Build query for listing campaigns - exclude deleted campaigns
    const query: any = { 
      userId: new ObjectId(auth.userId!),
      isDeleted: { $ne: true }  // Exclude soft-deleted campaigns
    };
    if (status) {
      query.status = status;
    }

    // Find user's campaigns
    const campaigns = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get real creator counts from campaign_creators collection for each campaign
    const campaignsWithCounts = await Promise.all(
      campaigns.map(async (c) => {
        const cId = c._id;
        
        // Get total creators in pipeline for this campaign
        const totalCreators = await creatorsCollection.countDocuments({ 
          campaignId: cId 
        });
        
        // Get matched/active creators (not declined or no_response)
        const matchedCreators = await creatorsCollection.countDocuments({ 
          campaignId: cId,
          currentStage: { $nin: ["declined", "no_response"] }
        });

        return {
          id: c._id?.toString(),
          name: c.name,
          description: c.description,
          status: c.status,
          budget: c.budget,
          startDate: c.startDate,
          endDate: c.endDate,
          creatorsCount: totalCreators,
          matchedCreators: matchedCreators,
          createdAt: c.createdAt,
        };
      })
    );

    return NextResponse.json({
      campaigns: campaignsWithCounts,
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const auth = await getUserIdFromToken(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { 
      name, description, budget, startDate, endDate, status,
      industry, platforms, followerRange, engagementRate,
      audienceAge, audienceGender, audienceLocation,
      contentType, contentStyle, postingFrequency, deliverables,
      minTrustScore, maxRiskLevel, brandValues, excludeCategories
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const collection = await getCampaignsCollection();
    const now = new Date();

    const campaign: Campaign = {
      userId: new ObjectId(auth.userId!),
      name,
      description: description || "",
      status: status || "draft",
      budget: budget || 0,
      startDate: startDate ? new Date(startDate) : now,
      endDate: endDate ? new Date(endDate) : undefined,
      // Platform & Reach
      industry: industry || "",
      platforms: platforms || [],
      followerRange: followerRange || "",
      engagementRate: engagementRate || "",
      // Audience Demographics
      audienceAge: audienceAge || [],
      audienceGender: audienceGender || "",
      audienceLocation: audienceLocation || [],
      // Content Requirements
      contentType: contentType || [],
      contentStyle: contentStyle || "",
      postingFrequency: postingFrequency || "",
      deliverables: deliverables || "",
      // Brand Safety
      minTrustScore: minTrustScore || "",
      maxRiskLevel: maxRiskLevel || "",
      brandValues: brandValues || [],
      excludeCategories: excludeCategories || [],
      // Counts
      creatorsCount: 0,
      matchedCreators: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(campaign);

    // Update user stats - increment active campaigns if status is active
    if (status === "active") {
      const statsCollection = (await clientPromise).db(DB_NAME).collection("user_stats");
      await statsCollection.updateOne(
        { userId: new ObjectId(auth.userId!) },
        { 
          $inc: { activeCampaigns: 1 },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      message: "Campaign created successfully",
      campaign: {
        id: result.insertedId.toString(),
        ...campaign,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update an existing campaign
export async function PUT(request: NextRequest) {
  try {
    const auth = await getUserIdFromToken(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { 
      id, name, description, budget, startDate, endDate, status,
      industry, platforms, followerRange, engagementRate,
      audienceAge, audienceGender, audienceLocation,
      contentType, contentStyle, postingFrequency, deliverables,
      minTrustScore, maxRiskLevel, brandValues, excludeCategories
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const collection = await getCampaignsCollection();
    
    // First, verify the campaign exists and belongs to this user
    const existingCampaign = await collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(auth.userId!),
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found or access denied" },
        { status: 404 }
      );
    }

    const now = new Date();
    const previousStatus = existingCampaign.status;

    // Build update object
    const updateData: Partial<Campaign> = {
      name,
      description: description || "",
      budget: budget || 0,
      status: status || existingCampaign.status,
      // Platform & Reach
      industry: industry ?? existingCampaign.industry,
      platforms: platforms ?? existingCampaign.platforms,
      followerRange: followerRange ?? existingCampaign.followerRange,
      engagementRate: engagementRate ?? existingCampaign.engagementRate,
      // Audience Demographics
      audienceAge: audienceAge ?? existingCampaign.audienceAge,
      audienceGender: audienceGender ?? existingCampaign.audienceGender,
      audienceLocation: audienceLocation ?? existingCampaign.audienceLocation,
      // Content Requirements
      contentType: contentType ?? existingCampaign.contentType,
      contentStyle: contentStyle ?? existingCampaign.contentStyle,
      postingFrequency: postingFrequency ?? existingCampaign.postingFrequency,
      deliverables: deliverables ?? existingCampaign.deliverables,
      // Brand Safety
      minTrustScore: minTrustScore ?? existingCampaign.minTrustScore,
      maxRiskLevel: maxRiskLevel ?? existingCampaign.maxRiskLevel,
      brandValues: brandValues ?? existingCampaign.brandValues,
      excludeCategories: excludeCategories ?? existingCampaign.excludeCategories,
      updatedAt: now,
    };

    if (startDate) {
      updateData.startDate = new Date(startDate);
    }
    if (endDate) {
      updateData.endDate = new Date(endDate);
    } else if (endDate === null) {
      updateData.endDate = undefined;
    }

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    // Update user stats if status changed
    const newStatus = status || existingCampaign.status;
    if (previousStatus !== newStatus) {
      const statsCollection = (await clientPromise).db(DB_NAME).collection("user_stats");
      
      // If changed from non-active to active, increment
      if (previousStatus !== "active" && newStatus === "active") {
        await statsCollection.updateOne(
          { userId: new ObjectId(auth.userId!) },
          { 
            $inc: { activeCampaigns: 1 },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
      }
      // If changed from active to non-active, decrement
      else if (previousStatus === "active" && newStatus !== "active") {
        await statsCollection.updateOne(
          { userId: new ObjectId(auth.userId!) },
          { 
            $inc: { activeCampaigns: -1 },
            $set: { updatedAt: new Date() }
          },
          { upsert: true }
        );
      }
    }

    // Fetch the updated campaign
    const updatedCampaign = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      message: "Campaign updated successfully",
      campaign: {
        id: updatedCampaign?._id?.toString(),
        name: updatedCampaign?.name,
        description: updatedCampaign?.description,
        status: updatedCampaign?.status,
        budget: updatedCampaign?.budget,
        startDate: updatedCampaign?.startDate,
        endDate: updatedCampaign?.endDate,
        // Platform & Reach
        industry: updatedCampaign?.industry,
        platforms: updatedCampaign?.platforms,
        followerRange: updatedCampaign?.followerRange,
        engagementRate: updatedCampaign?.engagementRate,
        // Audience Demographics
        audienceAge: updatedCampaign?.audienceAge,
        audienceGender: updatedCampaign?.audienceGender,
        audienceLocation: updatedCampaign?.audienceLocation,
        // Content Requirements
        contentType: updatedCampaign?.contentType,
        contentStyle: updatedCampaign?.contentStyle,
        postingFrequency: updatedCampaign?.postingFrequency,
        deliverables: updatedCampaign?.deliverables,
        // Brand Safety
        minTrustScore: updatedCampaign?.minTrustScore,
        maxRiskLevel: updatedCampaign?.maxRiskLevel,
        brandValues: updatedCampaign?.brandValues,
        excludeCategories: updatedCampaign?.excludeCategories,
        // Counts
        creatorsCount: updatedCampaign?.creatorsCount,
        matchedCreators: updatedCampaign?.matchedCreators,
        createdAt: updatedCampaign?.createdAt,
        updatedAt: updatedCampaign?.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update campaign status (partial update)
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await getUserIdFromToken(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["active", "draft", "completed"].includes(status)) {
      return NextResponse.json({ error: "Valid status required (active, draft, completed)" }, { status: 400 });
    }

    const collection = await getCampaignsCollection();

    // Verify the campaign belongs to this user
    const campaign = await collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(auth.userId!),
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const oldStatus = campaign.status;

    // Update only the status
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date() 
        } 
      }
    );

    // Update user stats if status changed to/from active
    if (oldStatus !== status) {
      const client = await clientPromise;
      const statsCollection = client.db(DB_NAME).collection("user_stats");
      
      if (oldStatus === "active" && status !== "active") {
        // Was active, now not active
        await statsCollection.updateOne(
          { userId: new ObjectId(auth.userId!) },
          { $inc: { activeCampaigns: -1 }, $set: { updatedAt: new Date() } }
        );
      } else if (oldStatus !== "active" && status === "active") {
        // Was not active, now active
        await statsCollection.updateOne(
          { userId: new ObjectId(auth.userId!) },
          { $inc: { activeCampaigns: 1 }, $set: { updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Campaign status updated",
      campaign: {
        id,
        status,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Update campaign status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a campaign (marks as deleted instead of removing)
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await getUserIdFromToken(request);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const hardDelete = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json({ error: "Campaign ID required" }, { status: 400 });
    }

    const collection = await getCampaignsCollection();
    const creatorsCollection = await getCampaignCreatorsCollection();

    // Verify the campaign belongs to this user
    const campaign = await collection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(auth.userId!),
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (hardDelete) {
      // Hard delete - actually remove from database
      await creatorsCollection.deleteMany({ campaignId: new ObjectId(id) });
      await collection.deleteOne({ _id: new ObjectId(id) });
    } else {
      // Soft delete - mark as deleted but keep in database
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            isDeleted: true,
            deletedAt: new Date(),
            status: "deleted",
            updatedAt: new Date() 
          } 
        }
      );
      
      // Also mark campaign creators as deleted
      await creatorsCollection.updateMany(
        { campaignId: new ObjectId(id) },
        { $set: { isDeleted: true, deletedAt: new Date() } }
      );
    }

    // Update user stats if campaign was active
    if (campaign.status === "active") {
      const client = await clientPromise;
      const statsCollection = client.db(DB_NAME).collection("user_stats");
      await statsCollection.updateOne(
        { userId: new ObjectId(auth.userId!) },
        {
          $inc: { activeCampaigns: -1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? "Campaign permanently deleted" : "Campaign moved to trash",
      deletedId: id,
      softDelete: !hardDelete
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

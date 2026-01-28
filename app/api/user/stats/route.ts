import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

// Stats interface
interface UserStats {
  userId: ObjectId;
  totalCreatorsVerified: number;
  perfectMatches: number;
  activeCampaigns: number;
  avgAlignmentScore: number;
  creatorsAnalyzed: number;
  highRiskDetected: number;
  weeklyCreatorChange: number;
  weeklyMatchChange: number;
  updatedAt: Date;
}

async function getStatsCollection(): Promise<Collection<UserStats>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserStats>("user_stats");
}

async function getCampaignsCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection("campaigns");
}

async function getCampaignCreatorsCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection("campaign_creators");
}

async function getAnalysesCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection("creator_analyses");
}

// Calculate real stats from database
async function calculateRealStats(userId: string): Promise<Partial<UserStats>> {
  const campaignsCol = await getCampaignsCollection();
  const creatorsCol = await getCampaignCreatorsCollection();
  const analysesCol = await getAnalysesCollection();
  
  const userObjectId = new ObjectId(userId);
  
  // Count active campaigns
  const activeCampaigns = await campaignsCol.countDocuments({ 
    userId: userObjectId,
    status: "active"
  });
  
  // Get all user's campaigns
  const userCampaigns = await campaignsCol.find({ userId: userObjectId }).toArray();
  const campaignIds = userCampaigns.map(c => c._id);
  
  // Count total creators in all pipelines (unique by creatorId)
  const totalCreatorsInPipeline = campaignIds.length > 0 
    ? await creatorsCol.countDocuments({ campaignId: { $in: campaignIds } })
    : 0;
  
  // Count matched creators (not declined/no_response)
  const matchedCreators = campaignIds.length > 0
    ? await creatorsCol.countDocuments({ 
        campaignId: { $in: campaignIds },
        currentStage: { $nin: ["declined", "no_response"] }
      })
    : 0;
  
  // Count creators analyzed by this user
  const creatorsAnalyzed = await analysesCol.countDocuments({ userId: userObjectId });
  
  // Calculate average alignment score from analyses
  const analysesWithScore = await analysesCol.find({ 
    userId: userObjectId,
    alignmentScore: { $exists: true }
  }).toArray();
  
  const avgAlignmentScore = analysesWithScore.length > 0
    ? analysesWithScore.reduce((sum, a) => sum + (a.alignmentScore || 0), 0) / analysesWithScore.length
    : 0;
  
  // Count high risk detected
  const highRiskDetected = await analysesCol.countDocuments({ 
    userId: userObjectId,
    riskLevel: "high"
  });
  
  return {
    activeCampaigns,
    creatorsAnalyzed,
    totalCreatorsVerified: totalCreatorsInPipeline,
    perfectMatches: matchedCreators,
    avgAlignmentScore: Math.round(avgAlignmentScore),
    highRiskDetected,
  };
}

// Initialize default stats for a new user
async function initializeUserStats(userId: string): Promise<UserStats> {
  const collection = await getStatsCollection();
  const now = new Date();
  
  const defaultStats: UserStats = {
    userId: new ObjectId(userId),
    totalCreatorsVerified: 0,
    perfectMatches: 0,
    activeCampaigns: 0,
    avgAlignmentScore: 0,
    creatorsAnalyzed: 0,
    highRiskDetected: 0,
    weeklyCreatorChange: 0,
    weeklyMatchChange: 0,
    updatedAt: now,
  };

  await collection.insertOne(defaultStats);
  return defaultStats;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const collection = await getStatsCollection();
    
    // Find user stats (for weekly changes)
    let stats = await collection.findOne({ userId: new ObjectId(payload.userId) });
    
    // If no stats exist, initialize them
    if (!stats) {
      await initializeUserStats(payload.userId);
      stats = await collection.findOne({ userId: new ObjectId(payload.userId) });
    }

    // Calculate real stats from database
    const realStats = await calculateRealStats(payload.userId);

    return NextResponse.json({
      stats: {
        totalCreatorsVerified: realStats.totalCreatorsVerified || 0,
        perfectMatches: realStats.perfectMatches || 0,
        activeCampaigns: realStats.activeCampaigns || 0,
        avgAlignmentScore: realStats.avgAlignmentScore || 0,
        creatorsAnalyzed: realStats.creatorsAnalyzed || 0,
        highRiskDetected: realStats.highRiskDetected || 0,
        weeklyCreatorChange: stats?.weeklyCreatorChange || 0,
        weeklyMatchChange: stats?.weeklyMatchChange || 0,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update stats
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const collection = await getStatsCollection();

    await collection.updateOne(
      { userId: new ObjectId(payload.userId) },
      { 
        $set: { 
          ...body,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Stats updated successfully" });
  } catch (error) {
    console.error("Update stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

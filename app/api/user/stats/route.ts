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
    
    // Find user stats
    let stats = await collection.findOne({ userId: new ObjectId(payload.userId) });
    
    // If no stats exist, initialize them
    if (!stats) {
      await initializeUserStats(payload.userId);
      stats = await collection.findOne({ userId: new ObjectId(payload.userId) });
    }

    if (!stats) {
      return NextResponse.json(
        { error: "Failed to initialize stats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stats: {
        totalCreatorsVerified: stats.totalCreatorsVerified,
        perfectMatches: stats.perfectMatches,
        activeCampaigns: stats.activeCampaigns,
        avgAlignmentScore: stats.avgAlignmentScore,
        creatorsAnalyzed: stats.creatorsAnalyzed,
        highRiskDetected: stats.highRiskDetected,
        weeklyCreatorChange: stats.weeklyCreatorChange,
        weeklyMatchChange: stats.weeklyMatchChange,
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

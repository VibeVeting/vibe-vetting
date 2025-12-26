import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

// Creator Analysis interface
interface CreatorAnalysis {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  avatar: string;
  handle: string;
  platform: string;
  followers: string;
  status: "verified" | "pending" | "risk";
  alignmentScore: number;
  riskLevel: "Low" | "Medium" | "High";
  analyzedAt: Date;
}

async function getAnalysesCollection(): Promise<Collection<CreatorAnalysis>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<CreatorAnalysis>("creator_analyses");
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

    const collection = await getAnalysesCollection();
    
    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Find user's recent analyses
    const analyses = await collection
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ analyzedAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      analyses: analyses.map((a) => ({
        id: a._id?.toString(),
        name: a.name,
        avatar: a.avatar,
        handle: a.handle,
        platform: a.platform,
        followers: a.followers,
        status: a.status,
        alignmentScore: a.alignmentScore,
        riskLevel: a.riskLevel,
        analyzedAt: a.analyzedAt,
      })),
    });
  } catch (error) {
    console.error("Get analyses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Add a new creator analysis
export async function POST(request: NextRequest) {
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
    const { name, handle, platform, followers, status, alignmentScore, riskLevel } = body;

    if (!name || !handle || !platform) {
      return NextResponse.json(
        { error: "Name, handle, and platform are required" },
        { status: 400 }
      );
    }

    const collection = await getAnalysesCollection();
    
    // Create avatar from name initials
    const avatar = name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const analysis: CreatorAnalysis = {
      userId: new ObjectId(payload.userId),
      name,
      avatar,
      handle,
      platform,
      followers: followers || "0",
      status: status || "pending",
      alignmentScore: alignmentScore || 0,
      riskLevel: riskLevel || "Medium",
      analyzedAt: new Date(),
    };

    const result = await collection.insertOne(analysis);

    // Update user stats
    const statsCollection = (await clientPromise).db(DB_NAME).collection("user_stats");
    await statsCollection.updateOne(
      { userId: new ObjectId(payload.userId) },
      { 
        $inc: { 
          creatorsAnalyzed: 1,
          totalCreatorsVerified: status === "verified" ? 1 : 0,
          highRiskDetected: status === "risk" ? 1 : 0,
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Analysis created successfully",
      analysis: {
        id: result.insertedId.toString(),
        ...analysis,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

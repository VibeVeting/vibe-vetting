import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

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
  creatorsCount: number;
  matchedCreators: number;
  createdAt: Date;
  updatedAt: Date;
}

async function getCampaignsCollection(): Promise<Collection<Campaign>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<Campaign>("campaigns");
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

    const collection = await getCampaignsCollection();
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query
    const query: any = { userId: new ObjectId(payload.userId) };
    if (status) {
      query.status = status;
    }

    // Find user's campaigns
    const campaigns = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c._id?.toString(),
        name: c.name,
        description: c.description,
        status: c.status,
        budget: c.budget,
        startDate: c.startDate,
        endDate: c.endDate,
        creatorsCount: c.creatorsCount,
        matchedCreators: c.matchedCreators,
        createdAt: c.createdAt,
      })),
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
    const { name, description, budget, startDate, endDate, status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Campaign name is required" },
        { status: 400 }
      );
    }

    const collection = await getCampaignsCollection();
    const now = new Date();

    const campaign: Campaign = {
      userId: new ObjectId(payload.userId),
      name,
      description: description || "",
      status: status || "draft",
      budget: budget || 0,
      startDate: startDate ? new Date(startDate) : now,
      endDate: endDate ? new Date(endDate) : undefined,
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
        { userId: new ObjectId(payload.userId) },
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

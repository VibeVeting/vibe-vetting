import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { AnalyticsModel } from "@/lib/models";

const DB_NAME = "vibe-vetting";

async function getUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (payload) {
      return payload.userId;
    }
  }
  
  // Fallback: get most recent user
  const client = await clientPromise;
  const users = client.db(DB_NAME).collection("users");
  const user = await users.findOne({}, { sort: { createdAt: -1 } });
  if (user) {
    return user._id.toString();
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ success: false, error: "No user found" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7d";

    const trends = await AnalyticsModel.getVerificationTrends(userId, period);

    return NextResponse.json({ success: true, trends });
  } catch (error) {
    console.error("Analytics trends fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

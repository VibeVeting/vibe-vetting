import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";
const SESSIONS_COLLECTION = "sessions";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password: string;
  company?: string;
  twoFactorEnabled?: boolean;
  currentPlan?: string;
  planUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getCollection(): Promise<Collection<UserDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>(COLLECTION_NAME);
}

async function getSessionsCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(SESSIONS_COLLECTION);
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Try to update session if it exists, but don't fail if it doesn't
    const sessions = await getSessionsCollection();
    const session = await sessions.findOne({ userId: new ObjectId(payload.userId), jti: payload.jti });
    if (session) {
      await sessions.updateOne({ _id: session._id }, { $set: { lastActive: new Date() } });
    }

    const collection = await getCollection();

    // Find user by ID
    const user = await collection.findOne({ _id: new ObjectId(payload.userId) });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        company: user.company,
        twoFactorEnabled: user.twoFactorEnabled || false,
        currentPlan: user.currentPlan || 'starter',
        planUpdatedAt: user.planUpdatedAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

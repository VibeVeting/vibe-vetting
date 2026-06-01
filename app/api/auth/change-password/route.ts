import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { hashPassword, verifyPassword, verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";
const SESSIONS_COLLECTION = "sessions";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password: string;
  company?: string;
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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Try to update session if it exists, but don't fail if it doesn't
    const sessions = await getSessionsCollection();
    const session = await sessions.findOne({ userId: new ObjectId(payload.userId), jti: payload.jti });
    if (session) {
      await sessions.updateOne({ _id: session._id }, { $set: { lastActive: new Date() } });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const collection = await getCollection();
    const user = await collection.findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(newPassword);
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashed,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
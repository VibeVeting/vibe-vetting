import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { NotificationModel } from "@/lib/models";

const DB_NAME = "vibe-vetting";
const SESSIONS_COLLECTION = "sessions";

async function validateSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "No token provided" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  // Try to update session if it exists, but don't fail if it doesn't
  const client = await clientPromise;
  const sessions = client.db(DB_NAME).collection(SESSIONS_COLLECTION);
  const session = await sessions.findOne({ userId: new ObjectId(payload.userId), jti: payload.jti });
  if (session) {
    await sessions.updateOne({ _id: session._id }, { $set: { lastActive: new Date() } });
  }

  return { payload };
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateSession(request);
  if (auth.error) return auth.error;

  const { id: notificationId } = await params;
  if (!ObjectId.isValid(notificationId)) {
    return NextResponse.json({ success: false, error: "Invalid notification id" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const read = !!body?.read;
    const updated = await NotificationModel.markRead(auth.payload!.userId, notificationId, read);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, read });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await validateSession(request);
  if (auth.error) return auth.error;

  const { id: notificationId } = await params;
  if (!ObjectId.isValid(notificationId)) {
    return NextResponse.json({ success: false, error: "Invalid notification id" }, { status: 400 });
  }

  try {
    const deleted = await NotificationModel.delete(auth.payload!.userId, notificationId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification delete error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

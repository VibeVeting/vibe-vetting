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

export async function GET(request: NextRequest) {
  const auth = await validateSession(request);
  if (auth.error) return auth.error;

  try {
    const notifications = await NotificationModel.findByUser(auth.payload!.userId);
    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await validateSession(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = (body?.title || "").trim();
    const content = (body?.body || "").trim();

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and body are required" }, { status: 400 });
    }

    const notification = await NotificationModel.create(auth.payload!.userId, {
      title,
      body: content,
      type: body?.type,
      metadata: body?.metadata,
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Notification create error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await validateSession(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    if (body?.markAllRead) {
      const count = await NotificationModel.markAllRead(auth.payload!.userId);
      return NextResponse.json({ success: true, markedCount: count });
    }
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notification mark all read error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

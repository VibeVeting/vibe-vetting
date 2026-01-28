import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "sessions";

interface SessionDoc {
  _id?: any;
  userId: ObjectId;
  jti: string;
  userAgent: string;
  ip?: string;
  createdAt: Date;
  lastActive: Date;
}

async function getSessionsCollection(): Promise<Collection<SessionDoc>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<SessionDoc>(COLLECTION_NAME);
}

// GET: list active sessions
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const sessionsCol = await getSessionsCollection();
    const sessions = await sessionsCol
      .find({ userId: new ObjectId(payload.userId) })
      .sort({ lastActive: -1 })
      .toArray();

    // Deduplicate: keep only the most recent session per userAgent
    const seenUserAgents = new Map<string, SessionDoc>();
    const duplicateIds: any[] = [];
    
    for (const session of sessions) {
      const ua = session.userAgent || 'unknown';
      if (!seenUserAgents.has(ua)) {
        seenUserAgents.set(ua, session);
      } else {
        // This is a duplicate - mark for deletion
        duplicateIds.push(session._id);
      }
    }
    
    // Clean up duplicates in background
    if (duplicateIds.length > 0) {
      sessionsCol.deleteMany({ _id: { $in: duplicateIds } }).catch(console.error);
    }
    
    // Return only unique sessions
    const uniqueSessions = Array.from(seenUserAgents.values());

    const formatted = uniqueSessions.map((s) => ({
      id: s._id?.toString(),
      userAgent: s.userAgent,
      ip: s.ip || "",
      createdAt: s.createdAt,
      lastActive: s.lastActive,
      isCurrent: s.jti === payload.jti,
    }));

    return NextResponse.json({ success: true, sessions: formatted });
  } catch (error) {
    console.error("List sessions error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: revoke a session or all others
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { sessionId, revokeAllOthers } = body as { sessionId?: string; revokeAllOthers?: boolean };

    const sessionsCol = await getSessionsCollection();

    if (revokeAllOthers) {
      await sessionsCol.deleteMany({ userId: new ObjectId(payload.userId), jti: { $ne: payload.jti } });
      return NextResponse.json({ success: true, message: "Signed out of other sessions" });
    }

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID is required" }, { status: 400 });
    }

    const target = await sessionsCol.findOne({ _id: new ObjectId(sessionId), userId: new ObjectId(payload.userId) });
    if (!target) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }
    if (target.jti === payload.jti) {
      return NextResponse.json({ success: false, error: "Cannot revoke current session from here" }, { status: 400 });
    }

    await sessionsCol.deleteOne({ _id: target._id });
    return NextResponse.json({ success: true, message: "Session revoked" });
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
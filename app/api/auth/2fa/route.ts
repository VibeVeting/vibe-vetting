import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";
const USERS = "users";
const CODES = "twofactor_codes";

export async function POST(request: NextRequest) {
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

    const { enable } = await request.json();
    const client = await clientPromise;
    const users = client.db(DB_NAME).collection(USERS);
    const codes = client.db(DB_NAME).collection(CODES);

    await users.updateOne({ _id: new ObjectId(payload.userId) }, { $set: { twoFactorEnabled: !!enable } });
    if (!enable) {
      await codes.deleteMany({ userId: new ObjectId(payload.userId) });
    }

    return NextResponse.json({ success: true, twoFactorEnabled: !!enable });
  } catch (error) {
    console.error("2FA toggle error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "vibe-vetting";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password: string;
  company?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>("users");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false });
    }

    const collection = await getUsersCollection();

    // Find user with this reset token
    const user = await collection.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    return NextResponse.json({ valid: !!user });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json({ valid: false });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";

const DB_NAME = "vibe-vetting";

interface BarterUserDocument {
  _id?: any;
  email: string;
  name: string;
  password: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getBarterUsersCollection(): Promise<Collection<BarterUserDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterUserDocument>("barter_users");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const collection = await getBarterUsersCollection();

    // Find barter user by email
    const user = await collection.findOne({ email: email.toLowerCase() });
    
    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpiry,
          updatedAt: new Date(),
        },
      }
    );

    // In production, you would send an email here
    // For development, we'll return the reset link
    // Use barter-specific reset password page
    const resetLink = `/reset-password?token=${resetToken}&type=barter`;

    // In production, remove the resetLink from response and send email instead
    return NextResponse.json({
      message: "If an account with that email exists, we've sent a password reset link.",
      // Development only - remove in production
      resetLink,
    });
  } catch (error) {
    console.error("Forgot password barter error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

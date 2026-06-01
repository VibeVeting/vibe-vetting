import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/services/ses-email-service";
import { EmailVerificationModel } from "@/lib/models/email-verification";

// 24 hours expiry
const TOKEN_EXPIRY_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, userType } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate userType
    const validUserTypes = ['brand', 'barter_creator', 'barter_company'];
    if (!userType || !validUserTypes.includes(userType)) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store token in database
    await EmailVerificationModel.create({
      email: email.toLowerCase(),
      token: verificationToken,
      userType,
      expiresAt,
    });

    // Send verification email via AWS SES
    const emailResult = await sendVerificationEmail({
      email,
      name: name || 'User',
      verificationToken,
      userType,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification email sent successfully",
        email: email.toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

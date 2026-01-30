import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail, generateVerificationToken } from "@/lib/services/ses-email-service";
import { EmailVerificationModel } from "@/lib/models/email-verification";

// 24 hours expiry
const TOKEN_EXPIRY_HOURS = 24;

// Rate limit: 3 resends per hour per email
const RESEND_COOLDOWN_MINUTES = 2;

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

    // Check for existing token and enforce cooldown
    const existingToken = await EmailVerificationModel.findByEmail(email, userType);
    
    if (existingToken) {
      // Check if already verified
      if (existingToken.verified) {
        return NextResponse.json(
          { error: "Email is already verified" },
          { status: 400 }
        );
      }
      
      // Check cooldown period
      const timeSinceCreation = Date.now() - existingToken.createdAt.getTime();
      const cooldownMs = RESEND_COOLDOWN_MINUTES * 60 * 1000;
      
      if (timeSinceCreation < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceCreation) / 1000);
        return NextResponse.json(
          { 
            error: `Please wait ${remainingSeconds} seconds before requesting another verification email`,
            retryAfter: remainingSeconds 
          },
          { status: 429 }
        );
      }
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store new token in database (this will delete old unverified tokens)
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
        message: "Verification email resent successfully",
        email: email.toLowerCase(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

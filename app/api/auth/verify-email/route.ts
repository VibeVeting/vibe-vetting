import { NextRequest, NextResponse } from "next/server";
import { EmailVerificationModel } from "@/lib/models/email-verification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Validate token
    const validation = await EmailVerificationModel.validateToken(token);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid token" },
        { status: 400 }
      );
    }

    // Mark token as verified
    const verified = await EmailVerificationModel.markAsVerified(token);
    
    if (!verified) {
      return NextResponse.json(
        { error: "Failed to verify email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
        email: validation.token?.email,
        userType: validation.token?.userType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint for direct link verification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userType = searchParams.get('type');

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(
        new URL('/verify-email?error=missing_token', request.url)
      );
    }

    // Validate token
    const validation = await EmailVerificationModel.validateToken(token);
    
    if (!validation.valid) {
      const errorType = validation.error?.includes('expired') ? 'expired' : 'invalid';
      return NextResponse.redirect(
        new URL(`/verify-email?error=${errorType}`, request.url)
      );
    }

    // Mark token as verified
    const verified = await EmailVerificationModel.markAsVerified(token);
    
    if (!verified) {
      return NextResponse.redirect(
        new URL('/verify-email?error=failed', request.url)
      );
    }

    // Redirect to success page with user type
    const redirectType = validation.token?.userType || userType || 'brand';
    return NextResponse.redirect(
      new URL(`/verify-email?success=true&type=${redirectType}`, request.url)
    );
  } catch (error) {
    console.error("Verify email GET error:", error);
    return NextResponse.redirect(
      new URL('/verify-email?error=server_error', request.url)
    );
  }
}

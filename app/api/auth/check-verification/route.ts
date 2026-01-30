import { NextRequest, NextResponse } from "next/server";
import { EmailVerificationModel } from "@/lib/models/email-verification";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userType = searchParams.get('type') as 'brand' | 'barter_creator' | 'barter_company';

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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

    // Check if email is verified
    const isVerified = await EmailVerificationModel.isEmailVerified(email, userType);

    return NextResponse.json(
      {
        email,
        userType,
        verified: isVerified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check verification status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

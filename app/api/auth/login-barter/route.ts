import { NextRequest, NextResponse } from "next/server";
import { BarterUserModel } from "@/lib/models/barter-user";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in barter_users collection
    const user = await BarterUserModel.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const { token } = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      userType: 'barter_creator',
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id!.toString(),
          name: user.name,
          email: user.email,
          userType: 'barter_creator',
          creatorProfile: user.creatorProfile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Barter login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

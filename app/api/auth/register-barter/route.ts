import { NextRequest, NextResponse } from "next/server";
import { BarterUserModel, CreateBarterUserInput } from "@/lib/models/barter-user";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, creatorProfile } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Validate creator profile
    if (!creatorProfile) {
      return NextResponse.json(
        { error: "Creator profile is required" },
        { status: 400 }
      );
    }

    if (!creatorProfile.primaryPlatform) {
      return NextResponse.json(
        { error: "Primary platform is required" },
        { status: 400 }
      );
    }

    if (!creatorProfile.followerCount) {
      return NextResponse.json(
        { error: "Follower count is required" },
        { status: 400 }
      );
    }

    if (!creatorProfile.niche) {
      return NextResponse.json(
        { error: "Niche is required" },
        { status: 400 }
      );
    }

    // Check if user already exists in barter_users collection
    const existingUser = await BarterUserModel.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create barter user
    const newUserData: CreateBarterUserInput = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: 'barter_creator',
      creatorProfile: {
        socialHandles: creatorProfile.socialHandles || {},
        primaryPlatform: creatorProfile.primaryPlatform,
        followerCount: creatorProfile.followerCount,
        niche: creatorProfile.niche,
        city: creatorProfile.city,
        whyBarter: creatorProfile.whyBarter,
        barterReady: creatorProfile.barterReady ?? true,
      },
    };

    const newUser = await BarterUserModel.create(newUserData);

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
      userType: 'barter_creator',
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Barter creator registered successfully",
        token,
        user: {
          id: newUser._id!.toString(),
          name: newUser.name,
          email: newUser.email,
          userType: 'barter_creator',
          creatorProfile: newUser.creatorProfile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Barter registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

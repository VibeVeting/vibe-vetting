import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/lib/models/user";

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findByEmail(userId.toLowerCase());
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        company: user.company || "",
        twoFactorEnabled: user.twoFactorEnabled || false,
        image: user.image || "",
        currentPlan: user.currentPlan || "starter",
        planUpdatedAt: user.planUpdatedAt || null,
      },
    });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, company } = body;

    // Find user by email first (lowercase for case-insensitive match)
    const existingUser = await UserModel.findByEmail(userId.toLowerCase());
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user
    const updateData: { name?: string; company?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;

    const updatedUser = await UserModel.update(
      existingUser._id!.toString(),
      updateData
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company || "",
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}

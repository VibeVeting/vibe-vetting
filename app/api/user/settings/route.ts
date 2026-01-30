import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/lib/models/user";
import { NotificationPreferences } from "@/types";

// Default notification preferences
const defaultNotificationPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
  weekly: true,
};

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
        notificationPreferences: user.notificationPreferences || defaultNotificationPreferences,
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
    const { name, company, notificationPreferences } = body;

    // Find user by email first (lowercase for case-insensitive match)
    const existingUser = await UserModel.findByEmail(userId.toLowerCase());
    
    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update the user
    const updateData: { name?: string; company?: string; notificationPreferences?: NotificationPreferences } = {};
    if (name !== undefined) updateData.name = name;
    if (company !== undefined) updateData.company = company;
    if (notificationPreferences !== undefined) {
      // Validate notification preferences
      updateData.notificationPreferences = {
        email: typeof notificationPreferences.email === 'boolean' ? notificationPreferences.email : true,
        push: typeof notificationPreferences.push === 'boolean' ? notificationPreferences.push : true,
        sms: typeof notificationPreferences.sms === 'boolean' ? notificationPreferences.sms : false,
        weekly: typeof notificationPreferences.weekly === 'boolean' ? notificationPreferences.weekly : true,
      };
    }

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
        notificationPreferences: updatedUser.notificationPreferences || defaultNotificationPreferences,
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

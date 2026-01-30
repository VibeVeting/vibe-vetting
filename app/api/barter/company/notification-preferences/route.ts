import { NextRequest, NextResponse } from "next/server";
import { BarterNotificationPreferencesModel } from "@/lib/models/barter-notification-preferences";
import { verifyToken } from "@/lib/auth";

// GET - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const doc = await BarterNotificationPreferencesModel.getOrCreate(decoded.userId);

    return NextResponse.json({
      success: true,
      preferences: doc.preferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.userType !== 'barter_company') {
      return NextResponse.json(
        { error: "Invalid token or not a barter company" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: "Preferences object is required" },
        { status: 400 }
      );
    }

    const doc = await BarterNotificationPreferencesModel.updatePreferences(
      decoded.userId,
      preferences
    );

    if (!doc) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated",
      preferences: doc.preferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

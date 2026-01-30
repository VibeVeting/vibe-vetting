import { NextRequest, NextResponse } from "next/server";
import { BarterNotificationPreferencesModel } from "@/lib/models/barter-notification-preferences";
import { BarterCompanyModel } from "@/lib/models/barter-company";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - Get security logs
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

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const logs = await BarterNotificationPreferencesModel.getSecurityLogs(decoded.userId, limit);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Get security logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Security actions (change password, toggle 2FA)
export async function POST(request: NextRequest) {
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
    const { action, currentPassword, newPassword, twoFactorEnabled } = body;

    // Get client info for logging
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Unknown';

    if (action === 'change_password') {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current password and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const company = await BarterCompanyModel.findById(decoded.userId);
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      const isValidPassword = await bcrypt.compare(currentPassword, company.password);
      if (!isValidPassword) {
        // Log failed password change attempt
        await BarterNotificationPreferencesModel.addSecurityLog(decoded.userId, {
          action: 'password_change_failed',
          ipAddress,
          userAgent,
          success: false,
          details: 'Incorrect current password provided',
        });

        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await BarterCompanyModel.update(decoded.userId, { password: hashedPassword });

      // Log successful password change
      await BarterNotificationPreferencesModel.addSecurityLog(decoded.userId, {
        action: 'password_changed',
        ipAddress,
        userAgent,
        success: true,
        details: 'Password changed successfully',
      });

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    }

    if (action === 'toggle_2fa') {
      const company = await BarterCompanyModel.findById(decoded.userId);
      if (!company) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      const newStatus = twoFactorEnabled ?? !company.twoFactorEnabled;

      await BarterCompanyModel.update(decoded.userId, { twoFactorEnabled: newStatus });

      // Log 2FA toggle
      await BarterNotificationPreferencesModel.addSecurityLog(decoded.userId, {
        action: newStatus ? '2fa_enabled' : '2fa_disabled',
        ipAddress,
        userAgent,
        success: true,
        details: newStatus ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
      });

      return NextResponse.json({
        success: true,
        message: newStatus ? "Two-factor authentication enabled" : "Two-factor authentication disabled",
        twoFactorEnabled: newStatus,
      });
    }

    if (action === 'clear_logs') {
      await BarterNotificationPreferencesModel.clearSecurityLogs(decoded.userId);
      
      return NextResponse.json({
        success: true,
        message: "Security logs cleared",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Security action error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all security logs
export async function DELETE(request: NextRequest) {
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

    await BarterNotificationPreferencesModel.clearSecurityLogs(decoded.userId);

    return NextResponse.json({
      success: true,
      message: "Security logs cleared",
    });
  } catch (error) {
    console.error("Clear security logs error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

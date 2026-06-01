import { NextRequest, NextResponse } from "next/server";
import { BarterCompanyModel } from "@/lib/models/barter-company";
import { BarterNotificationPreferencesModel } from "@/lib/models/barter-notification-preferences";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Get client info for security logging
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : 'Unknown';

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find company in barter_companies collection
    const company = await BarterCompanyModel.findByEmail(email);
    if (!company) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if company is active
    if (company.isActive === false) {
      // Log failed login attempt
      await BarterNotificationPreferencesModel.addSecurityLog(company._id!.toString(), {
        action: 'login_failed',
        ipAddress,
        userAgent,
        success: false,
        details: 'Account is deactivated',
      });

      return NextResponse.json(
        { error: "This account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, company.password);
    if (!isValid) {
      // Log failed login attempt
      await BarterNotificationPreferencesModel.addSecurityLog(company._id!.toString(), {
        action: 'login_failed',
        ipAddress,
        userAgent,
        success: false,
        details: 'Invalid password',
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Log successful login
    await BarterNotificationPreferencesModel.addSecurityLog(company._id!.toString(), {
      action: 'login_success',
      ipAddress,
      userAgent,
      success: true,
      details: 'Logged in successfully',
    });

    // Generate JWT token
    const { token } = generateToken({
      userId: company._id!.toString(),
      email: company.email,
      userType: 'barter_company',
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: {
          id: company._id!.toString(),
          email: company.email,
          userType: 'barter_company',
          companyProfile: company.companyProfile,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Barter company login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

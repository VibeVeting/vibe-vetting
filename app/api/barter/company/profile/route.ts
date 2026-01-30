import { NextRequest, NextResponse } from "next/server";
import { BarterCompanyModel } from "@/lib/models/barter-company";
import { verifyToken } from "@/lib/auth";

// GET - Get company profile
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

    const company = await BarterCompanyModel.findById(decoded.userId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Get company statistics
    const stats = await BarterCompanyModel.getStats(decoded.userId);

    return NextResponse.json({
      company: {
        id: company._id!.toString(),
        email: company.email,
        companyProfile: company.companyProfile,
        isVerified: company.isVerified,
        isActive: company.isActive,
        createdAt: company.createdAt,
      },
      stats
    });
  } catch (error) {
    console.error("Get barter company profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update company profile
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
    const { companyProfile } = body;

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile data is required" },
        { status: 400 }
      );
    }

    const updatedCompany = await BarterCompanyModel.update(decoded.userId, {
      companyProfile
    });

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      company: {
        id: updatedCompany._id!.toString(),
        email: updatedCompany.email,
        companyProfile: updatedCompany.companyProfile,
      }
    });
  } catch (error) {
    console.error("Update barter company profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

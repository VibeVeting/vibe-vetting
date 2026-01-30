import { NextRequest, NextResponse } from "next/server";
import { BarterCompanyModel, CreateBarterCompanyInput } from "@/lib/models/barter-company";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyProfile } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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

    // Validate company profile
    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile is required" },
        { status: 400 }
      );
    }

    if (!companyProfile.companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    if (!companyProfile.industry) {
      return NextResponse.json(
        { error: "Industry is required" },
        { status: 400 }
      );
    }

    if (!companyProfile.contactPerson) {
      return NextResponse.json(
        { error: "Contact person name is required" },
        { status: 400 }
      );
    }

    // Check if company already exists in barter_companies collection
    const existingCompany = await BarterCompanyModel.findByEmail(email);
    if (existingCompany) {
      return NextResponse.json(
        { error: "A company with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create barter company
    const newCompanyData: CreateBarterCompanyInput = {
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: 'barter_company',
      companyProfile: {
        companyName: companyProfile.companyName,
        industry: companyProfile.industry,
        website: companyProfile.website,
        logo: companyProfile.logo,
        description: companyProfile.description,
        city: companyProfile.city,
        address: companyProfile.address,
        gstNumber: companyProfile.gstNumber,
        contactPerson: companyProfile.contactPerson,
        contactPhone: companyProfile.contactPhone,
        socialHandles: companyProfile.socialHandles || {},
        productsCategories: companyProfile.productsCategories || [],
        averageProductValue: companyProfile.averageProductValue,
        monthlyBarterBudget: companyProfile.monthlyBarterBudget,
      },
    };

    const newCompany = await BarterCompanyModel.create(newCompanyData);

    // Generate JWT token
    const { token } = generateToken({
      userId: newCompany._id!.toString(),
      email: newCompany.email,
      userType: 'barter_company',
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Company registered successfully",
        token,
        user: {
          id: newCompany._id!.toString(),
          email: newCompany.email,
          userType: 'barter_company',
          companyProfile: newCompany.companyProfile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Barter company registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { BarterOfferModel, CreateBarterOfferInput } from "@/lib/models/barter-offer";
import { BarterCompanyModel } from "@/lib/models/barter-company";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET - Get all offers for the company
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

    const offers = await BarterOfferModel.findByBrand(decoded.userId);

    return NextResponse.json({ offers });
  } catch (error) {
    console.error("Get company offers error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new offer
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

    // Get company details
    const company = await BarterCompanyModel.findById(decoded.userId);
    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      productName,
      productDescription,
      productImage,
      productLink,
      productValue,
      productCategory,
      contentType,
      contentRequirement,
      script,
      hashtags,
      dos,
      donts,
      targetNiches,
      minFollowers,
      maxFollowers,
      targetCities,
      totalSlots,
      deadline,
    } = body;

    // Validate required fields
    if (!productName || !productValue || !productCategory || !contentType || !contentRequirement || !totalSlots || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const offerData: CreateBarterOfferInput = {
      brandId: new ObjectId(decoded.userId),
      brandName: company.companyProfile.companyName,
      brandLogo: company.companyProfile.logo,
      brandEmail: company.email,
      productName,
      productDescription,
      productImage,
      productLink,
      productValue,
      productCategory,
      contentType,
      contentRequirement,
      script,
      hashtags: hashtags || [],
      dos: dos || [],
      donts: donts || [],
      targetNiches: targetNiches || [],
      minFollowers,
      maxFollowers,
      targetCities,
      totalSlots,
      deadline: new Date(deadline),
      status: 'active',
    };

    const newOffer = await BarterOfferModel.create(offerData);

    return NextResponse.json({
      message: "Offer created successfully",
      offer: newOffer
    }, { status: 201 });
  } catch (error) {
    console.error("Create offer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { verifyToken } from "@/lib/auth";

// GET - Fetch all active offers for creators
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get("niche");
    const category = searchParams.get("category");

    let offers = await BarterOfferModel.findActive();

    // Filter by category if provided
    if (category && category !== 'all') {
      offers = offers.filter(o => o.productCategory.toLowerCase() === category.toLowerCase());
    }

    // Get applications for this creator to know which offers they've applied to
    const applications = await BarterApplicationModel.findByCreator(payload.userId);
    const appliedOfferIds = new Set(applications.map(a => a.offerId.toString()));

    // Add applied status to each offer
    const offersWithStatus = offers.map(offer => ({
      ...offer,
      _id: offer._id?.toString(),
      brandId: offer.brandId.toString(),
      hasApplied: appliedOfferIds.has(offer._id?.toString() || ''),
      application: applications.find(a => a.offerId.toString() === offer._id?.toString()),
    }));

    return NextResponse.json({ offers: offersWithStatus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching barter offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new barter offer (for brands)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Only non-barter users (brands) can create offers
    if (payload.userType === 'barter_creator') {
      return NextResponse.json({ error: "Creators cannot create offers" }, { status: 403 });
    }

    const body = await request.json();
    const {
      brandName,
      brandLogo,
      productName,
      productDescription,
      productImage,
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
    if (!brandName || !productName || !productValue || !productCategory || 
        !contentType || !contentRequirement || !totalSlots || !deadline) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const offer = await BarterOfferModel.create({
      brandId: payload.userId as any,
      brandName,
      brandLogo,
      brandEmail: payload.email,
      productName,
      productDescription,
      productImage,
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
    });

    return NextResponse.json({ 
      message: "Offer created successfully",
      offer: { ...offer, _id: offer._id?.toString() }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating barter offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "vibe-vetting";

// GET - Get all applications for company's offers
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

    // Get search params
    const { searchParams } = new URL(request.url);
    const offerId = searchParams.get('offerId');
    const status = searchParams.get('status');

    // Get all offers for this company
    const companyOffers = await BarterOfferModel.findByBrand(decoded.userId);
    const offerIds = companyOffers.map(o => o._id!);

    if (offerIds.length === 0) {
      return NextResponse.json({ applications: [] });
    }

    // Get applications for these offers
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const applicationsCollection = db.collection('barter_applications');

    const filter: Record<string, unknown> = {
      offerId: offerId 
        ? new ObjectId(offerId) 
        : { $in: offerIds }
    };

    if (status) {
      filter.status = status;
    }

    const applications = await applicationsCollection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Attach offer details to each application
    const applicationsWithOffers = applications.map(app => {
      const offer = companyOffers.find(o => o._id!.toString() === app.offerId.toString());
      return {
        ...app,
        offer: offer ? {
          _id: offer._id,
          productName: offer.productName,
          productImage: offer.productImage,
          productValue: offer.productValue,
          contentType: offer.contentType,
          deadline: offer.deadline,
        } : null
      };
    });

    return NextResponse.json({ applications: applicationsWithOffers });
  } catch (error) {
    console.error("Get company applications error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

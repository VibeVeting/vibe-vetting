import { NextRequest, NextResponse } from "next/server";
import { BarterCompanyModel } from "@/lib/models/barter-company";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { verifyToken } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "vibe-vetting";

// GET - Get company stats and analytics
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

    const companyId = decoded.userId;
    
    // Get basic stats
    const stats = await BarterCompanyModel.getStats(companyId);
    
    // Get additional analytics
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const offersCollection = db.collection('barter_offers');
    const applicationsCollection = db.collection('barter_applications');
    
    const companyObjectId = new ObjectId(companyId);
    
    // Get offers for this company
    const offers = await offersCollection.find({ brandId: companyObjectId }).toArray();
    const offerIds = offers.map(o => o._id);
    
    // Calculate total product value given away
    const completedApplications = await applicationsCollection.find({
      offerId: { $in: offerIds },
      status: { $in: ['completed', 'shipped'] }
    }).toArray();
    
    let totalProductValueGiven = 0;
    for (const app of completedApplications) {
      const offer = offers.find(o => o._id.toString() === app.offerId.toString());
      if (offer) {
        totalProductValueGiven += offer.productValue || 0;
      }
    }
    
    // Get applications by status
    const applicationsByStatus = await applicationsCollection.aggregate([
      { $match: { offerId: { $in: offerIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray();
    
    const statusCounts: Record<string, number> = {};
    for (const item of applicationsByStatus) {
      statusCounts[item._id] = item.count;
    }
    
    // Get recent applications
    const recentApplications = await applicationsCollection
      .find({ offerId: { $in: offerIds } })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Get top performing offers (by applications)
    const topOffers = offers
      .sort((a, b) => (b.filledSlots || 0) - (a.filledSlots || 0))
      .slice(0, 5)
      .map(o => ({
        _id: o._id,
        productName: o.productName,
        productValue: o.productValue,
        filledSlots: o.filledSlots || 0,
        totalSlots: o.totalSlots,
        status: o.status,
      }));

    return NextResponse.json({
      stats,
      analytics: {
        totalProductValueGiven,
        applicationsByStatus: statusCounts,
        recentApplications: recentApplications.map(a => ({
          _id: a._id,
          creatorName: a.creatorName,
          status: a.status,
          appliedAt: a.appliedAt,
        })),
        topOffers,
        averageApplicationsPerOffer: offers.length > 0 
          ? Math.round((stats.totalApplications / offers.length) * 10) / 10 
          : 0,
      }
    });
  } catch (error) {
    console.error("Get company stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

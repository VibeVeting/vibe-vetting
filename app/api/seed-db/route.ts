import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "vibe-vetting";

// GET request - just visit /api/seed-db in browser to seed data
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Find the user by email (vinay@gmail.com or any existing user)
    const usersCollection = db.collection("users");
    let user = await usersCollection.findOne({ email: "vinay@gmail.com" });
    
    if (!user) {
      // Try to find any user
      user = await usersCollection.findOne({});
    }

    if (!user) {
      return NextResponse.json({
        error: "No user found. Please register first at /register",
      }, { status: 404 });
    }

    const userId = new ObjectId(user._id);
    console.log("Seeding data for user:", user.email, userId.toString());

    // 1. Seed user_stats
    const statsCollection = db.collection("user_stats");
    await statsCollection.deleteMany({ userId });
    const statsResult = await statsCollection.insertOne({
      userId,
      totalCreatorsVerified: 847,
      perfectMatches: 23,
      activeCampaigns: 12,
      avgAlignmentScore: 94,
      creatorsAnalyzed: 1250,
      highRiskDetected: 8,
      weeklyCreatorChange: 12,
      weeklyMatchChange: 3,
      updatedAt: new Date(),
    });
    console.log("Stats inserted:", statsResult.insertedId);

    // 2. Seed creator_analyses
    const analysesCollection = db.collection("creator_analyses");
    await analysesCollection.deleteMany({ userId });
    
    const creators = [
      {
        creatorName: "Alex Thompson",
        platform: "Instagram",
        alignmentScore: 98,
        status: "verified",
        followers: "2.4M",
        engagement: "4.8%",
        niche: "Lifestyle & Fashion",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        handle: "@alexthompson",
        riskLevel: "Low",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        creatorName: "Sarah Chen",
        platform: "YouTube",
        alignmentScore: 95,
        status: "verified",
        followers: "1.8M",
        engagement: "6.2%",
        niche: "Tech Reviews",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        handle: "@sarahchen",
        riskLevel: "Low",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        creatorName: "Mike Rodriguez",
        platform: "TikTok",
        alignmentScore: 87,
        status: "pending",
        followers: "890K",
        engagement: "8.1%",
        niche: "Comedy & Entertainment",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        handle: "@mikerodriguez",
        riskLevel: "Medium",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        creatorName: "Emily Watson",
        platform: "Instagram",
        alignmentScore: 92,
        status: "verified",
        followers: "1.2M",
        engagement: "5.4%",
        niche: "Fitness & Health",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
        handle: "@emilywatson",
        riskLevel: "Low",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
      {
        creatorName: "David Kim",
        platform: "YouTube",
        alignmentScore: 45,
        status: "flagged",
        followers: "3.1M",
        engagement: "3.2%",
        niche: "Gaming",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        handle: "@davidkim",
        riskLevel: "High",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        creatorName: "Jessica Miller",
        platform: "TikTok",
        alignmentScore: 89,
        status: "verified",
        followers: "650K",
        engagement: "9.3%",
        niche: "Beauty & Skincare",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        handle: "@jessicamiller",
        riskLevel: "Low",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        creatorName: "Chris Anderson",
        platform: "Instagram",
        alignmentScore: 78,
        status: "pending",
        followers: "420K",
        engagement: "4.1%",
        niche: "Travel",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        handle: "@chrisanderson",
        riskLevel: "Medium",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      },
      {
        creatorName: "Amanda Foster",
        platform: "YouTube",
        alignmentScore: 96,
        status: "verified",
        followers: "5.2M",
        engagement: "5.8%",
        niche: "Education & Learning",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
        handle: "@amandafoster",
        riskLevel: "Low",
        analyzedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
      },
    ];

    for (const creator of creators) {
      await analysesCollection.insertOne({
        userId,
        name: creator.creatorName,
        ...creator,
        createdAt: creator.analyzedAt,
      });
    }
    console.log("Creators inserted:", creators.length);

    // 3. Seed campaigns
    const campaignsCollection = db.collection("campaigns");
    await campaignsCollection.deleteMany({ userId });

    const campaigns = [
      {
        name: "Summer Fashion Launch",
        status: "active",
        budget: 50000,
        spent: 32500,
        creatorsAssigned: 8,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
        description: "Summer collection promotion with lifestyle influencers",
        platforms: ["Instagram", "TikTok"],
      },
      {
        name: "Tech Product Review",
        status: "active",
        budget: 75000,
        spent: 45000,
        creatorsAssigned: 12,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
        description: "New gadget launch with tech reviewers",
        platforms: ["YouTube"],
      },
      {
        name: "Fitness Challenge Q1",
        status: "active",
        budget: 30000,
        spent: 28000,
        creatorsAssigned: 5,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        description: "30-day fitness challenge campaign",
        platforms: ["Instagram", "YouTube", "TikTok"],
      },
      {
        name: "Holiday Special 2024",
        status: "completed",
        budget: 100000,
        spent: 98500,
        creatorsAssigned: 20,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        endDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        description: "Holiday season promotional campaign",
        platforms: ["Instagram", "TikTok"],
      },
      {
        name: "Brand Awareness Drive",
        status: "draft",
        budget: 40000,
        spent: 0,
        creatorsAssigned: 0,
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 37),
        description: "Q2 brand awareness campaign",
        platforms: ["YouTube", "TikTok"],
      },
    ];

    for (const campaign of campaigns) {
      await campaignsCollection.insertOne({
        userId,
        ...campaign,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log("Campaigns inserted:", campaigns.length);

    return NextResponse.json({
      success: true,
      message: "✅ Data seeded successfully!",
      user: {
        id: userId.toString(),
        email: user.email,
        name: user.name,
      },
      seeded: {
        stats: 1,
        creators: creators.length,
        campaigns: campaigns.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({
      error: "Failed to seed data",
      details: String(error),
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

export async function POST(request: NextRequest) {
  try {
    let userId: ObjectId;

    // Try to get userId from token, but fall back to getting it from the request body
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const payload = verifyToken(token);
      if (payload) {
        userId = new ObjectId(payload.userId);
      } else {
        // Token invalid - try to get userId from users collection by looking up the most recent user
        const client = await clientPromise;
        const users = client.db(DB_NAME).collection("users");
        const user = await users.findOne({}, { sort: { createdAt: -1 } });
        if (!user) {
          return NextResponse.json({ error: "No users found. Please register first." }, { status: 400 });
        }
        userId = user._id;
        console.log("Using fallback userId:", userId.toString());
      }
    } else {
      // No token - get the most recent user
      const client = await clientPromise;
      const users = client.db(DB_NAME).collection("users");
      const user = await users.findOne({}, { sort: { createdAt: -1 } });
      if (!user) {
        return NextResponse.json({ error: "No users found. Please register first." }, { status: 400 });
      }
      userId = user._id;
      console.log("Using fallback userId (no token):", userId.toString());
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const trendsCollection = db.collection("verification_trends");

    // Clear existing data for this user
    await trendsCollection.deleteMany({ userId });

    // Generate 90 days of fake data
    const now = new Date();
    const documents = [];

    for (let i = 90; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Generate realistic varying data
      const dayOfWeek = date.getDay();
      // Higher activity on weekdays
      const baseVerified = dayOfWeek === 0 || dayOfWeek === 6 ? 5 : 10;
      const baseMatches = dayOfWeek === 0 || dayOfWeek === 6 ? 3 : 7;

      // Add some randomness and growth trend over time
      const growthFactor = 1 + (90 - i) * 0.005; // 0.5% growth per day
      const verified = Math.floor((baseVerified + Math.random() * 8) * growthFactor);
      const matches = Math.floor((baseMatches + Math.random() * 5) * growthFactor);

      documents.push({
        userId,
        date,
        verified,
        matches,
      });
    }

    await trendsCollection.insertMany(documents);

    // Also seed some notifications
    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.deleteMany({ userId });

    const notificationData = [
      {
        userId,
        title: "Perfect Creator Match Found!",
        body: "Sarah Johnson matches your 'Summer Fashion' campaign with 98% alignment score.",
        type: "match",
        read: false,
        createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 min ago
        metadata: { avatar: "👩‍🎨", score: 98, actionUrl: "/creators/sarah-johnson", actionLabel: "View Profile" },
      },
      {
        userId,
        title: "Risk Alert: Engagement Drop",
        body: "@techinfluencer123 has shown a 45% drop in engagement over the last 7 days.",
        type: "alert",
        read: false,
        createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
        metadata: { avatar: "⚠️", actionUrl: "/creators/techinfluencer123", actionLabel: "Review" },
      },
      {
        userId,
        title: "Campaign Milestone Reached",
        body: "Your 'Ola Ride Revolution' campaign has reached 50 creator applications!",
        type: "campaign",
        read: false,
        createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
        metadata: { avatar: "🎯", actionUrl: "/campaigns/ola-ride-revolution", actionLabel: "View Campaign" },
      },
      {
        userId,
        title: "Creator Verified Successfully",
        body: "Mike Chen has been verified with a trust score of 94%. Ready for collaboration!",
        type: "success",
        read: true,
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: { avatar: "✅", score: 94, actionUrl: "/creators/mike-chen", actionLabel: "Start Collaboration" },
      },
      {
        userId,
        title: "AI Insight: Trending Niche",
        body: "Sustainable Fashion content is trending +340% this week. Consider targeting this niche.",
        type: "insight",
        read: true,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        metadata: { avatar: "💡", actionUrl: "/creators/discover?category=sustainable-fashion", actionLabel: "Explore Creators" },
      },
      {
        userId,
        title: "Weekly Report Ready",
        body: "Your weekly analytics report for Jan 13-20 is now available for download.",
        type: "system",
        read: true,
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        metadata: { avatar: "📊", actionUrl: "/analytics", actionLabel: "View Report" },
      },
      {
        userId,
        title: "New Creator Recommendations",
        body: "Based on your recent campaigns, we found 12 new creators that match your brand.",
        type: "match",
        read: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: { avatar: "🎁", actionUrl: "/creators/discover", actionLabel: "View All" },
      },
      {
        userId,
        title: "Fake Engagement Detected",
        body: "Our AI detected suspicious activity on @fashionblogger_fake. Proceed with caution.",
        type: "alert",
        read: true,
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata: { avatar: "🛡️", actionUrl: "/creators/fashionblogger_fake", actionLabel: "View Details" },
      },
      {
        userId,
        title: "Campaign Budget Alert",
        body: "Your 'Tech Launch 2026' campaign has used 80% of its allocated budget.",
        type: "campaign",
        read: true,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        metadata: { avatar: "💰", actionUrl: "/campaigns/tech-launch-2026", actionLabel: "Manage Budget" },
      },
      {
        userId,
        title: "Collaboration Completed",
        body: "The collaboration with Emma Wilson for 'Beauty Essentials' has been marked as complete.",
        type: "success",
        read: true,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        metadata: { avatar: "🎉" },
      },
    ];

    await notificationsCollection.insertMany(notificationData);

    return NextResponse.json({
      success: true,
      message: "Seeded 91 days of verification trends and 10 notifications",
      trendsCount: documents.length,
      notificationsCount: notificationData.length,
    });
  } catch (error) {
    console.error("Seed analytics error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

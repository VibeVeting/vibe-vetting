import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

interface PlatformStats {
  platform: string;
  creators: number;
  avgScore: number;
  performance: number;
  icon: string;
  color: string;
}

async function getAnalysesCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection("creator_analyses");
}

// GET - Fetch platform breakdown statistics
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

    const collection = await getAnalysesCollection();
    const userId = new ObjectId(payload.userId);

    // Aggregate platform statistics from creator analyses
    const platformAggregation = await collection.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: { $toLower: "$platform" },
          creators: { $sum: 1 },
          avgScore: { $avg: "$trustScore" },
          avgEngagement: { $avg: { $toDouble: { $replaceAll: { input: "$engagementRate", find: "%", replacement: "" } } } },
        },
      },
      {
        $project: {
          platform: "$_id",
          creators: 1,
          avgScore: { $round: ["$avgScore", 0] },
          avgEngagement: { $round: ["$avgEngagement", 1] },
        },
      },
    ]).toArray();

    // Platform configuration for icons and colors
    const platformConfig: Record<string, { icon: string; color: string }> = {
      instagram: { icon: "fa-instagram", color: "#E4405F" },
      youtube: { icon: "fa-youtube", color: "#FF0000" },
      tiktok: { icon: "fa-tiktok", color: "#000000" },
      twitter: { icon: "fa-x-twitter", color: "#1DA1F2" },
      linkedin: { icon: "fa-linkedin", color: "#0A66C2" },
      facebook: { icon: "fa-facebook", color: "#1877F2" },
    };

    // Default platforms with zero data
    const defaultPlatforms: PlatformStats[] = [
      { platform: "Instagram", creators: 0, avgScore: 0, performance: 0, icon: "fa-instagram", color: "#E4405F" },
      { platform: "YouTube", creators: 0, avgScore: 0, performance: 0, icon: "fa-youtube", color: "#FF0000" },
      { platform: "TikTok", creators: 0, avgScore: 0, performance: 0, icon: "fa-tiktok", color: "#000000" },
      { platform: "Twitter", creators: 0, avgScore: 0, performance: 0, icon: "fa-x-twitter", color: "#1DA1F2" },
    ];

    // Merge aggregated data with defaults
    const platformStats: PlatformStats[] = defaultPlatforms.map((defaultPlatform) => {
      const platformKey = defaultPlatform.platform.toLowerCase();
      const aggregated = platformAggregation.find((p) => p.platform === platformKey);

      if (aggregated) {
        const config = platformConfig[platformKey] || { icon: "fa-globe", color: "#6B7280" };
        return {
          platform: defaultPlatform.platform,
          creators: aggregated.creators,
          avgScore: aggregated.avgScore || 0,
          performance: Math.round((aggregated.avgEngagement || 0) * 20), // Convert engagement rate to performance percentage
          icon: config.icon,
          color: config.color,
        };
      }
      return defaultPlatform;
    });

    // Add any additional platforms found in the data
    platformAggregation.forEach((agg) => {
      const platformName = agg.platform.charAt(0).toUpperCase() + agg.platform.slice(1);
      if (!platformStats.find((p) => p.platform.toLowerCase() === agg.platform)) {
        const config = platformConfig[agg.platform] || { icon: "fa-globe", color: "#6B7280" };
        platformStats.push({
          platform: platformName,
          creators: agg.creators,
          avgScore: agg.avgScore || 0,
          performance: Math.round((agg.avgEngagement || 0) * 20),
          icon: config.icon,
          color: config.color,
        });
      }
    });

    // Sort by number of creators
    platformStats.sort((a, b) => b.creators - a.creators);

    return NextResponse.json({ platforms: platformStats }, { status: 200 });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const userId = new ObjectId(payload.userId);

    // Seed User Stats
    const statsCollection = db.collection("user_stats");
    await statsCollection.deleteMany({ userId });
    await statsCollection.insertOne({
      userId,
      totalCreatorsVerified: 147,
      perfectMatches: 23,
      activeCampaigns: 8,
      avgAlignmentScore: 87.5,
      creatorsAnalyzed: 312,
      highRiskDetected: 12,
      weeklyCreatorChange: 12,
      weeklyMatchChange: 5,
      updatedAt: new Date(),
    });

    // Seed Creator Analyses with comprehensive data for Creator Analysis page
    const analysesCollection = db.collection("creator_analyses");
    await analysesCollection.deleteMany({ userId });
    
    const creatorAnalyses = [
      {
        userId,
        creatorId: "sarah-johnson-001",
        creatorName: "Sarah Johnson",
        creatorHandle: "@sarahjcreates",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        platform: "Instagram",
        followers: "2.4M",
        following: "892",
        posts: "1,847",
        engagementRate: "4.8%",
        avgViews: "185K",
        avgLikes: "98.5K",
        avgComments: "3.2K",
        avgShares: "1.8K",
        trustScore: 94,
        alignmentScore: 94,
        riskLevel: "low",
        status: "verified",
        isRisingStar: true,
        growthRate: "+18%",
        joinedDate: "March 2019",
        niche: "Lifestyle & Fashion",
        location: "Los Angeles, CA",
        bio: "Fashion & lifestyle content creator. Sharing everyday style tips and sustainable fashion choices. Collaborating with mindful brands.",
        coreMetrics: {
          audienceAuthenticity: 96,
          contentQuality: 93,
          brandSafety: 98,
          engagementRate: 92,
          professionalism: 95,
          growthTrajectory: 89
        },
        engagementData: {
          likes: { value: 98500, percentage: 68, trend: "+15%" },
          comments: { value: 3200, percentage: 22, trend: "+12%" },
          shares: { value: 1800, percentage: 6, trend: "+8%" },
          saves: { value: 2400, percentage: 4, trend: "+25%" }
        },
        contentAnalysis: {
          totalPosts: 1847,
          avgPostsPerWeek: 4.2,
          topPerformingType: "Reels",
          contentTypes: [
            { type: "Reels", count: 645, percentage: 35 },
            { type: "Photos", count: 739, percentage: 40 },
            { type: "Carousels", count: 463, percentage: 25 }
          ],
          topHashtags: ["#sustainablefashion", "#ootd", "#styleinspo", "#fashioncreator", "#minimalistfashion"],
          postingSchedule: "Most active: Mon-Wed, 9AM-12PM PST"
        },
        brandAlignment: {
          overallScore: 94,
          vision: { score: 96, description: "Strong alignment with modern brand aesthetics and sustainable values" },
          mission: { score: 92, description: "Content actively promotes mindful consumption" },
          values: { score: 95, description: "Authentic voice and ethical brand partnerships" },
          audience: { score: 93, description: "High overlap with target demographic (25-34, urban)" },
          tone: { score: 91, description: "Professional yet approachable communication style" }
        },
        futurePrediction: {
          overall: "positive",
          confidence: 89,
          prediction: "Strong trajectory indicates continued growth with 30-40% audience increase in next 12 months. High potential for long-term brand partnerships.",
          factors: [
            { factor: "Audience Growth", impact: "positive", score: 92, description: "Consistent organic growth pattern" },
            { factor: "Content Consistency", impact: "positive", score: 88, description: "Regular posting schedule maintained" },
            { factor: "Brand Partnerships", impact: "positive", score: 85, description: "Track record of successful collaborations" },
            { factor: "Community Sentiment", impact: "positive", score: 94, description: "Very positive audience engagement" },
            { factor: "Trend Alignment", impact: "positive", score: 90, description: "Stays current with platform trends" }
          ]
        },
        risingStarData: {
          isRisingStar: true,
          starScore: 91,
          indicators: [
            { label: "Rapid Growth", value: true, detail: "+18% growth in last 30 days" },
            { label: "High Engagement", value: true, detail: "4.8% vs 2.1% industry average" },
            { label: "Viral Content", value: true, detail: "3 posts exceeded 1M views" },
            { label: "Community Building", value: true, detail: "Strong audience loyalty metrics" },
            { label: "Untapped Potential", value: true, detail: "Undervalued for current reach" }
          ],
          projectedReach: "4M-5M in 12 months",
          recommendedAction: "Partner early for optimal ROI - rising star with exceptional growth trajectory"
        },
        authenticityData: {
          score: 96,
          realFollowers: 94,
          suspiciousActivity: 2,
          engagementQuality: 95,
          audienceGrowth: "organic",
          checks: [
            { check: "Follower/Following Ratio", status: "pass", detail: "Healthy 2,690:1 ratio" },
            { check: "Engagement Pattern", status: "pass", detail: "Natural distribution across posts" },
            { check: "Comment Quality", status: "pass", detail: "Genuine, contextual comments" },
            { check: "Growth Pattern", status: "pass", detail: "Organic growth detected" },
            { check: "Bot Detection", status: "pass", detail: "Only 2% suspicious followers" },
            { check: "Audience Location", status: "pass", detail: "Geographic distribution matches niche" }
          ]
        },
        recentPosts: [
          { id: 1, type: "reel", thumbnail: "🎬", likes: 145000, comments: 4520, shares: 2100, views: 850000 },
          { id: 2, type: "photo", thumbnail: "📸", likes: 82000, comments: 2890, shares: 890, views: 320000 },
          { id: 3, type: "carousel", thumbnail: "🖼️", likes: 95000, comments: 3200, shares: 1450, views: 410000 },
          { id: 4, type: "reel", thumbnail: "🎬", likes: 128000, comments: 3850, shares: 1980, views: 720000 }
        ],
        strengths: [
          { title: "Exceptional Authenticity", description: "96% authentic engagement with genuine audience interactions" },
          { title: "Consistent Brand Voice", description: "Maintains professional yet relatable tone across all content" },
          { title: "High-Quality Visuals", description: "Professional photography and video production standards" },
          { title: "Strong Community", description: "Active and engaged follower base with high loyalty metrics" }
        ],
        concerns: [],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        userId,
        creatorId: "mike-chen-002",
        creatorName: "Mike Chen",
        creatorHandle: "@mikechentech",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        platform: "YouTube",
        followers: "1.8M",
        following: "245",
        posts: "892",
        engagementRate: "6.2%",
        avgViews: "420K",
        avgLikes: "45K",
        avgComments: "2.8K",
        avgShares: "1.2K",
        trustScore: 91,
        alignmentScore: 91,
        riskLevel: "low",
        status: "verified",
        isRisingStar: false,
        growthRate: "+12%",
        joinedDate: "June 2017",
        niche: "Technology & Reviews",
        location: "San Francisco, CA",
        bio: "Tech reviewer and gadget enthusiast. In-depth reviews, tutorials, and the latest in consumer electronics. Making tech accessible for everyone.",
        coreMetrics: {
          audienceAuthenticity: 93,
          contentQuality: 95,
          brandSafety: 97,
          engagementRate: 88,
          professionalism: 94,
          growthTrajectory: 85
        },
        engagementData: {
          likes: { value: 45000, percentage: 62, trend: "+10%" },
          comments: { value: 2800, percentage: 25, trend: "+8%" },
          shares: { value: 1200, percentage: 8, trend: "+5%" },
          saves: { value: 800, percentage: 5, trend: "+12%" }
        },
        contentAnalysis: {
          totalPosts: 892,
          avgPostsPerWeek: 2.5,
          topPerformingType: "Reviews",
          contentTypes: [
            { type: "Reviews", count: 450, percentage: 50 },
            { type: "Tutorials", count: 268, percentage: 30 },
            { type: "Unboxings", count: 178, percentage: 20 }
          ],
          topHashtags: ["#techreview", "#gadgets", "#smartphone", "#technology", "#techtips"],
          postingSchedule: "Most active: Tue, Thu, 2PM-4PM PST"
        },
        brandAlignment: {
          overallScore: 91,
          vision: { score: 92, description: "Expert positioning aligns with premium tech brands" },
          mission: { score: 90, description: "Educational content supports informed purchasing" },
          values: { score: 93, description: "Honest, unbiased review approach" },
          audience: { score: 89, description: "Tech-savvy demographic 25-45 years" },
          tone: { score: 88, description: "Professional, knowledgeable communication" }
        },
        futurePrediction: {
          overall: "positive",
          confidence: 85,
          prediction: "Steady growth expected with 20-25% audience increase. Strong potential for sponsored content and brand deals in tech sector.",
          factors: [
            { factor: "Audience Growth", impact: "positive", score: 85, description: "Consistent growth in subscriber base" },
            { factor: "Content Consistency", impact: "positive", score: 90, description: "Regular upload schedule" },
            { factor: "Brand Partnerships", impact: "positive", score: 88, description: "Strong track record with tech brands" },
            { factor: "Community Sentiment", impact: "positive", score: 91, description: "Trusted voice in tech community" },
            { factor: "Trend Alignment", impact: "neutral", score: 78, description: "Focuses on evergreen content" }
          ]
        },
        risingStarData: {
          isRisingStar: false,
          starScore: 0,
          indicators: [],
          projectedReach: "N/A",
          recommendedAction: "Established creator - standard partnership terms recommended"
        },
        authenticityData: {
          score: 93,
          realFollowers: 92,
          suspiciousActivity: 3,
          engagementQuality: 94,
          audienceGrowth: "organic",
          checks: [
            { check: "Follower/Following Ratio", status: "pass", detail: "Healthy 7,347:1 ratio" },
            { check: "Engagement Pattern", status: "pass", detail: "Consistent engagement across videos" },
            { check: "Comment Quality", status: "pass", detail: "Technical discussions and questions" },
            { check: "Growth Pattern", status: "pass", detail: "Steady organic growth" },
            { check: "Bot Detection", status: "pass", detail: "Only 3% suspicious subscribers" },
            { check: "Audience Location", status: "pass", detail: "US-focused with global reach" }
          ]
        },
        recentPosts: [
          { id: 1, type: "video", thumbnail: "🎥", likes: 52000, comments: 3100, shares: 1450, views: 520000 },
          { id: 2, type: "video", thumbnail: "🎥", likes: 41000, comments: 2500, shares: 980, views: 380000 },
          { id: 3, type: "video", thumbnail: "🎥", likes: 48000, comments: 2900, shares: 1200, views: 450000 },
          { id: 4, type: "video", thumbnail: "🎥", likes: 38000, comments: 2200, shares: 850, views: 340000 }
        ],
        strengths: [
          { title: "Expert Authority", description: "Recognized voice in tech review space with 91% trust score" },
          { title: "High Production Value", description: "Professional video quality and editing standards" },
          { title: "Engaged Community", description: "Active comment section with genuine technical discussions" }
        ],
        concerns: [],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        userId,
        creatorId: "emma-wilson-003",
        creatorName: "Emma Wilson",
        creatorHandle: "@emmawilsonfit",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
        platform: "TikTok",
        followers: "3.2M",
        following: "456",
        posts: "2,340",
        engagementRate: "7.5%",
        avgViews: "580K",
        avgLikes: "125K",
        avgComments: "4.5K",
        avgShares: "8.2K",
        trustScore: 78,
        alignmentScore: 78,
        riskLevel: "medium",
        status: "pending",
        isRisingStar: true,
        growthRate: "+32%",
        joinedDate: "January 2021",
        niche: "Fitness & Wellness",
        location: "Miami, FL",
        bio: "Certified trainer & wellness advocate. Quick workouts, nutrition tips, and mental health awareness. Making fitness fun and accessible!",
        coreMetrics: {
          audienceAuthenticity: 75,
          contentQuality: 82,
          brandSafety: 85,
          engagementRate: 95,
          professionalism: 72,
          growthTrajectory: 96
        },
        engagementData: {
          likes: { value: 125000, percentage: 55, trend: "+28%" },
          comments: { value: 4500, percentage: 15, trend: "+20%" },
          shares: { value: 8200, percentage: 25, trend: "+35%" },
          saves: { value: 3800, percentage: 5, trend: "+18%" }
        },
        contentAnalysis: {
          totalPosts: 2340,
          avgPostsPerWeek: 8.5,
          topPerformingType: "Workout Videos",
          contentTypes: [
            { type: "Workout Videos", count: 1170, percentage: 50 },
            { type: "Tips & Tricks", count: 702, percentage: 30 },
            { type: "Motivational", count: 468, percentage: 20 }
          ],
          topHashtags: ["#fitness", "#workout", "#fitnesstiktok", "#gymtok", "#healthylifestyle"],
          postingSchedule: "Most active: Daily, 6AM-8AM & 6PM-8PM EST"
        },
        brandAlignment: {
          overallScore: 78,
          vision: { score: 80, description: "Good alignment with fitness and wellness brands" },
          mission: { score: 75, description: "Content promotes active lifestyle" },
          values: { score: 82, description: "Authentic fitness journey shared" },
          audience: { score: 78, description: "Young demographic 18-28 years" },
          tone: { score: 72, description: "High energy, sometimes informal" }
        },
        futurePrediction: {
          overall: "positive",
          confidence: 82,
          prediction: "Explosive growth potential with 50-60% increase projected. High viral content potential but monitor for consistency.",
          factors: [
            { factor: "Audience Growth", impact: "positive", score: 96, description: "Exceptional growth trajectory" },
            { factor: "Content Consistency", impact: "neutral", score: 72, description: "High volume, variable quality" },
            { factor: "Brand Partnerships", impact: "neutral", score: 68, description: "Limited brand experience" },
            { factor: "Community Sentiment", impact: "positive", score: 88, description: "Highly engaged fanbase" },
            { factor: "Trend Alignment", impact: "positive", score: 94, description: "Masters viral trends" }
          ]
        },
        risingStarData: {
          isRisingStar: true,
          starScore: 94,
          indicators: [
            { label: "Rapid Growth", value: true, detail: "+32% growth in last 30 days" },
            { label: "High Engagement", value: true, detail: "7.5% vs 3.2% platform average" },
            { label: "Viral Content", value: true, detail: "5 videos exceeded 5M views" },
            { label: "Community Building", value: true, detail: "Strong follower interaction" },
            { label: "Untapped Potential", value: true, detail: "Huge upside for brand deals" }
          ],
          projectedReach: "6M-8M in 12 months",
          recommendedAction: "High-priority prospect - lock in partnership before value increases"
        },
        authenticityData: {
          score: 75,
          realFollowers: 78,
          suspiciousActivity: 12,
          engagementQuality: 82,
          audienceGrowth: "mixed",
          checks: [
            { check: "Follower/Following Ratio", status: "pass", detail: "Good 7,018:1 ratio" },
            { check: "Engagement Pattern", status: "pass", detail: "High but variable engagement" },
            { check: "Comment Quality", status: "pass", detail: "Mix of genuine and generic" },
            { check: "Growth Pattern", status: "warning", detail: "Rapid growth requires monitoring" },
            { check: "Bot Detection", status: "warning", detail: "12% suspicious followers detected" },
            { check: "Audience Location", status: "pass", detail: "US-centric audience" }
          ]
        },
        recentPosts: [
          { id: 1, type: "video", thumbnail: "🏋️", likes: 185000, comments: 5200, shares: 12000, views: 1200000 },
          { id: 2, type: "video", thumbnail: "🏋️", likes: 145000, comments: 4100, shares: 8500, views: 890000 },
          { id: 3, type: "video", thumbnail: "🏋️", likes: 98000, comments: 3800, shares: 6200, views: 520000 },
          { id: 4, type: "video", thumbnail: "🏋️", likes: 112000, comments: 4500, shares: 7800, views: 680000 }
        ],
        strengths: [
          { title: "Viral Potential", description: "Exceptional ability to create trending content" },
          { title: "High Engagement", description: "7.5% engagement rate significantly above platform average" },
          { title: "Growing Influence", description: "Rapid audience growth indicates rising star status" }
        ],
        concerns: [
          { title: "Audience Authenticity", description: "12% suspicious follower activity detected", severity: "medium" },
          { title: "Content Consistency", description: "Quality varies between posts, needs standardization", severity: "low" }
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        userId,
        creatorId: "david-park-004",
        creatorName: "David Park",
        creatorHandle: "@davidparkgaming",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        platform: "Twitch",
        followers: "890K",
        following: "182",
        posts: "1,245",
        engagementRate: "2.8%",
        avgViews: "45K",
        avgLikes: "8.2K",
        avgComments: "1.5K",
        avgShares: "320",
        trustScore: 45,
        alignmentScore: 45,
        riskLevel: "high",
        status: "risk",
        isRisingStar: false,
        growthRate: "-5%",
        joinedDate: "August 2018",
        niche: "Gaming & Entertainment",
        location: "Seattle, WA",
        bio: "Pro gamer and content creator. Streaming daily and competing in esports. Part of Team Phoenix.",
        coreMetrics: {
          audienceAuthenticity: 42,
          contentQuality: 55,
          brandSafety: 38,
          engagementRate: 45,
          professionalism: 40,
          growthTrajectory: 35
        },
        engagementData: {
          likes: { value: 8200, percentage: 58, trend: "-8%" },
          comments: { value: 1500, percentage: 28, trend: "-5%" },
          shares: { value: 320, percentage: 10, trend: "-12%" },
          saves: { value: 180, percentage: 4, trend: "-3%" }
        },
        contentAnalysis: {
          totalPosts: 1245,
          avgPostsPerWeek: 6.0,
          topPerformingType: "Streams",
          contentTypes: [
            { type: "Live Streams", count: 748, percentage: 60 },
            { type: "Highlights", count: 374, percentage: 30 },
            { type: "Tutorials", count: 125, percentage: 10 }
          ],
          topHashtags: ["#gaming", "#twitch", "#esports", "#fortnite", "#streaming"],
          postingSchedule: "Most active: Daily streams, 8PM-2AM PST"
        },
        brandAlignment: {
          overallScore: 45,
          vision: { score: 48, description: "Limited alignment with mainstream brands" },
          mission: { score: 42, description: "Entertainment-focused, less brand synergy" },
          values: { score: 40, description: "Controversial statements in past streams" },
          audience: { score: 52, description: "Young male demographic 16-24" },
          tone: { score: 38, description: "Casual, sometimes inappropriate language" }
        },
        futurePrediction: {
          overall: "negative",
          confidence: 72,
          prediction: "Declining engagement and past controversies suggest caution. Brand safety risks outweigh potential benefits.",
          factors: [
            { factor: "Audience Growth", impact: "negative", score: 35, description: "Declining subscriber count" },
            { factor: "Content Consistency", impact: "neutral", score: 65, description: "Regular streaming schedule" },
            { factor: "Brand Partnerships", impact: "negative", score: 38, description: "Previous sponsor issues" },
            { factor: "Community Sentiment", impact: "negative", score: 42, description: "Mixed community reception" },
            { factor: "Trend Alignment", impact: "neutral", score: 58, description: "Follows gaming trends" }
          ]
        },
        risingStarData: {
          isRisingStar: false,
          starScore: 0,
          indicators: [],
          projectedReach: "N/A",
          recommendedAction: "Not recommended for brand partnerships at this time"
        },
        authenticityData: {
          score: 42,
          realFollowers: 45,
          suspiciousActivity: 38,
          engagementQuality: 48,
          audienceGrowth: "declining",
          checks: [
            { check: "Follower/Following Ratio", status: "pass", detail: "4,890:1 ratio" },
            { check: "Engagement Pattern", status: "warning", detail: "Declining engagement trend" },
            { check: "Comment Quality", status: "warning", detail: "High ratio of spam/bot comments" },
            { check: "Growth Pattern", status: "fail", detail: "Negative growth detected" },
            { check: "Bot Detection", status: "fail", detail: "38% suspicious followers" },
            { check: "Audience Location", status: "warning", detail: "Unusual geographic distribution" }
          ]
        },
        recentPosts: [
          { id: 1, type: "stream", thumbnail: "🎮", likes: 7800, comments: 1200, shares: 280, views: 42000 },
          { id: 2, type: "video", thumbnail: "🎮", likes: 8500, comments: 1450, shares: 350, views: 48000 },
          { id: 3, type: "stream", thumbnail: "🎮", likes: 6200, comments: 980, shares: 210, views: 35000 },
          { id: 4, type: "video", thumbnail: "🎮", likes: 9100, comments: 1680, shares: 420, views: 55000 }
        ],
        strengths: [
          { title: "Dedicated Schedule", description: "Consistent streaming schedule maintained" },
          { title: "Gaming Expertise", description: "Skilled player with competitive experience" }
        ],
        concerns: [
          { title: "Brand Safety Issues", description: "History of controversial statements during streams", severity: "high" },
          { title: "Declining Audience", description: "5% decline in followers over past 30 days", severity: "high" },
          { title: "Bot Activity", description: "38% suspicious follower activity detected", severity: "high" },
          { title: "Previous Sponsor Issues", description: "Reported conflicts with past brand partners", severity: "medium" }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        userId,
        creatorId: "lisa-martinez-005",
        creatorName: "Lisa Martinez",
        creatorHandle: "@lisamartinezstyle",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        platform: "Instagram",
        followers: "1.5M",
        following: "624",
        posts: "1,456",
        engagementRate: "5.2%",
        avgViews: "120K",
        avgLikes: "68K",
        avgComments: "2.4K",
        avgShares: "980",
        trustScore: 89,
        alignmentScore: 89,
        riskLevel: "low",
        status: "verified",
        isRisingStar: false,
        growthRate: "+8%",
        joinedDate: "November 2018",
        niche: "Beauty & Style",
        location: "New York, NY",
        bio: "Beauty editor turned creator. Honest reviews, everyday glam, and accessible beauty tips. Diversity advocate in the beauty industry.",
        coreMetrics: {
          audienceAuthenticity: 91,
          contentQuality: 92,
          brandSafety: 95,
          engagementRate: 86,
          professionalism: 93,
          growthTrajectory: 82
        },
        engagementData: {
          likes: { value: 68000, percentage: 65, trend: "+6%" },
          comments: { value: 2400, percentage: 22, trend: "+4%" },
          shares: { value: 980, percentage: 8, trend: "+10%" },
          saves: { value: 1200, percentage: 5, trend: "+15%" }
        },
        contentAnalysis: {
          totalPosts: 1456,
          avgPostsPerWeek: 3.8,
          topPerformingType: "Tutorials",
          contentTypes: [
            { type: "Tutorials", count: 582, percentage: 40 },
            { type: "Reviews", count: 437, percentage: 30 },
            { type: "GRWM", count: 437, percentage: 30 }
          ],
          topHashtags: ["#beauty", "#makeup", "#skincare", "#beautytips", "#makeuptutorial"],
          postingSchedule: "Most active: Wed-Sat, 11AM-1PM EST"
        },
        brandAlignment: {
          overallScore: 89,
          vision: { score: 91, description: "Strong alignment with beauty and lifestyle brands" },
          mission: { score: 88, description: "Promotes inclusive beauty standards" },
          values: { score: 92, description: "Authentic and honest product reviews" },
          audience: { score: 87, description: "Female demographic 22-35 years" },
          tone: { score: 85, description: "Warm, relatable, professional" }
        },
        futurePrediction: {
          overall: "positive",
          confidence: 84,
          prediction: "Stable growth trajectory with strong brand partnership potential. Trusted voice in beauty community.",
          factors: [
            { factor: "Audience Growth", impact: "positive", score: 82, description: "Steady organic growth" },
            { factor: "Content Consistency", impact: "positive", score: 88, description: "Regular quality content" },
            { factor: "Brand Partnerships", impact: "positive", score: 90, description: "Excellent brand history" },
            { factor: "Community Sentiment", impact: "positive", score: 89, description: "Highly trusted by audience" },
            { factor: "Trend Alignment", impact: "positive", score: 85, description: "Balances trends and classics" }
          ]
        },
        risingStarData: {
          isRisingStar: false,
          starScore: 0,
          indicators: [],
          projectedReach: "N/A",
          recommendedAction: "Established creator with strong track record - recommended for partnerships"
        },
        authenticityData: {
          score: 91,
          realFollowers: 92,
          suspiciousActivity: 4,
          engagementQuality: 93,
          audienceGrowth: "organic",
          checks: [
            { check: "Follower/Following Ratio", status: "pass", detail: "Healthy 2,404:1 ratio" },
            { check: "Engagement Pattern", status: "pass", detail: "Natural engagement distribution" },
            { check: "Comment Quality", status: "pass", detail: "Genuine beauty discussions" },
            { check: "Growth Pattern", status: "pass", detail: "Steady organic growth" },
            { check: "Bot Detection", status: "pass", detail: "Only 4% suspicious followers" },
            { check: "Audience Location", status: "pass", detail: "US-focused, metro areas" }
          ]
        },
        recentPosts: [
          { id: 1, type: "reel", thumbnail: "💄", likes: 78000, comments: 2800, shares: 1100, views: 280000 },
          { id: 2, type: "photo", thumbnail: "💄", likes: 62000, comments: 2100, shares: 850, views: 180000 },
          { id: 3, type: "carousel", thumbnail: "💄", likes: 71000, comments: 2500, shares: 920, views: 220000 },
          { id: 4, type: "reel", thumbnail: "💄", likes: 85000, comments: 3200, shares: 1350, views: 320000 }
        ],
        strengths: [
          { title: "Industry Authority", description: "Former beauty editor with professional credibility" },
          { title: "Honest Reviews", description: "Known for unbiased, thorough product reviews" },
          { title: "Diverse Representation", description: "Actively promotes inclusivity in beauty" }
        ],
        concerns: [],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];
    
    await analysesCollection.insertMany(creatorAnalyses);

    // Seed Campaigns
    const campaignsCollection = db.collection("campaigns");
    await campaignsCollection.deleteMany({ userId });
    
    const campaigns = [
      {
        userId,
        name: "Summer Product Launch",
        description: "Launching our new summer collection with top lifestyle creators",
        status: "active",
        budget: 50000,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        creatorsCount: 12,
        matchedCreators: 8,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Tech Review Series",
        description: "Partner with tech influencers for product reviews",
        status: "active",
        budget: 35000,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        creatorsCount: 8,
        matchedCreators: 6,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Fitness Brand Awareness",
        description: "Health and wellness campaign with fitness influencers",
        status: "active",
        budget: 25000,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
        creatorsCount: 15,
        matchedCreators: 10,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Holiday Gift Guide",
        description: "Collaborate with creators for holiday shopping content",
        status: "completed",
        budget: 75000,
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        creatorsCount: 20,
        matchedCreators: 18,
        createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        name: "Spring Fashion Collection",
        description: "Fashion influencer partnerships for spring line",
        status: "draft",
        budget: 40000,
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creatorsCount: 10,
        matchedCreators: 0,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Back to School",
        description: "Educational content creators for back to school season",
        status: "completed",
        budget: 30000,
        startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        creatorsCount: 14,
        matchedCreators: 12,
        createdAt: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        name: "Gaming Tournament Promo",
        description: "Partner with gaming streamers for tournament promotion",
        status: "active",
        budget: 45000,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        creatorsCount: 6,
        matchedCreators: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        userId,
        name: "Sustainable Living",
        description: "Eco-friendly product promotion with sustainability influencers",
        status: "active",
        budget: 20000,
        startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        creatorsCount: 9,
        matchedCreators: 7,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ];
    
    await campaignsCollection.insertMany(campaigns);

    // Seed Notifications
    const notificationsCollection = db.collection("notifications");
    await notificationsCollection.deleteMany({ userId });
    
    const notifications = [
      {
        userId,
        title: "New Creator Match Found!",
        body: "Sarah Johnson (94% match) has been identified as a perfect fit for your Summer Product Launch campaign.",
        type: "match",
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        metadata: {
          creatorName: "Sarah Johnson",
          campaignName: "Summer Product Launch",
          score: 94,
          actionUrl: "/campaigns",
          actionLabel: "View Match",
          avatar: "🎯"
        }
      },
      {
        userId,
        title: "AI Insight: Engagement Pattern Detected",
        body: "Our AI detected that your tech campaign creators perform 47% better when posting on Tuesdays between 2-4 PM.",
        type: "insight",
        read: false,
        createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
        metadata: {
          actionUrl: "/analytics",
          actionLabel: "View Analytics",
          avatar: "🧠"
        }
      },
      {
        userId,
        title: "Risk Alert: Suspicious Activity Detected",
        body: "David Park's account shows signs of fake engagement. 32% of followers appear to be bots. Consider reviewing partnership.",
        type: "alert",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata: {
          creatorName: "David Park",
          actionUrl: "/creators",
          actionLabel: "Review Creator",
          avatar: "⚠️"
        }
      },
      {
        userId,
        title: "Campaign Milestone Reached!",
        body: "Congratulations! Your Tech Review Series campaign has reached 1M impressions ahead of schedule.",
        type: "success",
        read: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        metadata: {
          campaignName: "Tech Review Series",
          actionUrl: "/campaigns",
          actionLabel: "View Campaign",
          avatar: "🎉"
        }
      },
      {
        userId,
        title: "New Creator Match: Mike Chen",
        body: "Mike Chen (91% match) specializes in tech reviews and aligns perfectly with your brand values.",
        type: "match",
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        metadata: {
          creatorName: "Mike Chen",
          campaignName: "Tech Review Series",
          score: 91,
          actionUrl: "/creators",
          actionLabel: "View Profile",
          avatar: "💡"
        }
      },
      {
        userId,
        title: "Contract Signed: Lisa Martinez",
        body: "Lisa Martinez has signed the partnership agreement for the Summer Product Launch campaign.",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        readAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        metadata: {
          creatorName: "Lisa Martinez",
          campaignName: "Summer Product Launch",
          actionUrl: "/contracts",
          actionLabel: "View Contract",
          avatar: "✅"
        }
      },
      {
        userId,
        title: "Campaign Update: Fitness Brand Awareness",
        body: "3 new creators have been added to your Fitness Brand Awareness campaign. Review their profiles now.",
        type: "campaign",
        read: true,
        createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), // 1.5 days ago
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        metadata: {
          campaignName: "Fitness Brand Awareness",
          actionUrl: "/campaigns",
          actionLabel: "View Updates",
          avatar: "📢"
        }
      },
      {
        userId,
        title: "AI Recommendation: Budget Optimization",
        body: "Based on current performance, reallocating 15% of budget from Instagram to TikTok could improve ROI by 23%.",
        type: "insight",
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        readAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        metadata: {
          actionUrl: "/analytics",
          actionLabel: "View Analysis",
          avatar: "📊"
        }
      },
      {
        userId,
        title: "Weekly Report Available",
        body: "Your weekly creator performance report is ready. View insights on engagement rates, reach, and ROI metrics.",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        readAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000),
        metadata: {
          actionUrl: "/analytics",
          actionLabel: "View Report",
          avatar: "📄"
        }
      },
      {
        userId,
        title: "New Creator Match: Emma Wilson",
        body: "Emma Wilson (78% match) is trending in fitness content. She could be a good fit for your wellness campaigns.",
        type: "match",
        read: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        metadata: {
          creatorName: "Emma Wilson",
          campaignName: "Fitness Brand Awareness",
          score: 78,
          actionUrl: "/creators",
          actionLabel: "View Profile",
          avatar: "🏃‍♀️"
        }
      },
      {
        userId,
        title: "Payment Processed",
        body: "Payment of $5,000 has been successfully processed for James Brown's collaboration.",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        metadata: {
          creatorName: "James Brown",
          actionUrl: "/contracts",
          actionLabel: "View Details",
          avatar: "💰"
        }
      },
      {
        userId,
        title: "Content Submitted for Review",
        body: "Anna Lee has submitted 3 video drafts for your review. Please provide feedback within 48 hours.",
        type: "campaign",
        read: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        readAt: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000),
        metadata: {
          creatorName: "Anna Lee",
          actionUrl: "/campaigns",
          actionLabel: "Review Content",
          avatar: "🎬"
        }
      },
      {
        userId,
        title: "Platform Update: New Features",
        body: "We've added new AI-powered creator discovery features and improved matching algorithms. Check them out!",
        type: "system",
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        readAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        metadata: {
          actionUrl: "/dashboard",
          actionLabel: "Explore Features",
          avatar: "🚀"
        }
      },
      {
        userId,
        title: "Campaign Completed: Holiday Gift Guide",
        body: "Your Holiday Gift Guide campaign has concluded with excellent results: 5.2M reach, 320K engagements.",
        type: "success",
        read: true,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        readAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        metadata: {
          campaignName: "Holiday Gift Guide",
          actionUrl: "/analytics",
          actionLabel: "View Results",
          avatar: "🎄"
        }
      }
    ];
    
    await notificationsCollection.insertMany(notifications);

    return NextResponse.json({
      success: true,
      message: "Sample data seeded successfully!",
      data: {
        stats: 1,
        analyses: creatorAnalyses.length,
        campaigns: campaigns.length,
        notifications: notifications.length,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}

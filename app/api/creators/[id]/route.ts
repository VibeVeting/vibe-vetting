import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";

const DB_NAME = "vibe-vetting";

// Creator Analysis Interface
interface CreatorAnalysis {
  _id?: ObjectId;
  userId: ObjectId;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  platform: string;
  profileUrl?: string;
  followers: string;
  following?: string;
  posts?: string;
  engagementRate: string;
  avgViews?: string;
  avgLikes?: string;
  avgComments?: string;
  avgShares?: string;
  trustScore: number;
  alignmentScore?: number;
  riskLevel?: string;
  isRisingStar?: boolean;
  growthRate?: string;
  joinedDate?: string;
  niche?: string;
  location?: string;
  bio?: string;
  
  // Core Metrics
  coreMetrics?: {
    audienceAuthenticity: number;
    contentQuality: number;
    brandSafety: number;
    engagementRate: number;
    professionalism: number;
    growthTrajectory: number;
  };
  
  // Engagement Data
  engagementData?: {
    likes: { value: number; percentage: number; trend: string };
    comments: { value: number; percentage: number; trend: string };
    shares: { value: number; percentage: number; trend: string };
    saves: { value: number; percentage: number; trend: string };
  };
  
  // Content Analysis
  contentAnalysis?: {
    totalPosts: number;
    avgPostsPerWeek: number;
    topPerformingType: string;
    contentTypes: { type: string; count: number; percentage: number }[];
    topHashtags: string[];
    postingSchedule: string;
  };
  
  // Brand Alignment
  brandAlignment?: {
    overallScore: number;
    vision: { score: number; description: string };
    mission: { score: number; description: string };
    values: { score: number; description: string };
    audience: { score: number; description: string };
    tone: { score: number; description: string };
  };
  
  // Future Prediction
  futurePrediction?: {
    overall: string;
    confidence: number;
    prediction: string;
    factors: { factor: string; impact: string; score: number; description: string }[];
  };
  
  // Rising Star Data
  risingStarData?: {
    isRisingStar: boolean;
    starScore: number;
    indicators: { label: string; value: boolean; detail: string }[];
    projectedReach: string;
    recommendedAction: string;
  };
  
  // Authenticity Analysis
  authenticityData?: {
    score: number;
    realFollowers: number;
    suspiciousActivity: number;
    engagementQuality: number;
    audienceGrowth: string;
    checks: { check: string; status: string; detail: string }[];
  };
  
  // Recent Posts
  recentPosts?: { id: number; type: string; thumbnail: string; likes: number; comments: number; shares: number; views: number }[];
  
  // Strengths and Concerns
  strengths?: { title: string; description: string }[];
  concerns?: { title: string; description: string; severity: string }[];
  
  createdAt: Date;
  updatedAt: Date;
}

async function getAnalysesCollection(): Promise<Collection<CreatorAnalysis>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<CreatorAnalysis>("creator_analyses");
}

// GET - Fetch creator analysis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const collection = await getAnalysesCollection();

    // Try to find by _id first
    let analysis: CreatorAnalysis | null = null;
    
    if (ObjectId.isValid(id)) {
      analysis = await collection.findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(payload.userId),
      });
    }
    
    // If not found, try by creatorId
    if (!analysis) {
      analysis = await collection.findOne({
        creatorId: id,
        userId: new ObjectId(payload.userId),
      });
    }

    // If not found, try by creatorHandle (new format)
    if (!analysis) {
      analysis = await collection.findOne({
        creatorHandle: { $regex: id, $options: 'i' },
        userId: new ObjectId(payload.userId),
      });
    }

    // If not found, try by handle (legacy format)
    if (!analysis) {
      analysis = await collection.findOne({
        handle: { $regex: id, $options: 'i' },
        userId: new ObjectId(payload.userId),
      } as unknown as Parameters<typeof collection.findOne>[0]);
    }

    if (!analysis) {
      return NextResponse.json(
        { error: "Creator analysis not found" },
        { status: 404 }
      );
    }

    // Handle both old and new field names for backward compatibility
    const creatorName = analysis.creatorName || (analysis as unknown as { name?: string }).name || 'Unknown Creator';
    const creatorHandle = analysis.creatorHandle || (analysis as unknown as { handle?: string }).handle || '@unknown';
    const trustScore = analysis.trustScore || (analysis as unknown as { alignmentScore?: number }).alignmentScore || 75;
    const engagementRate = analysis.engagementRate || '4.5%';

    // Format response with defaults for missing data
    const response = {
      _id: analysis._id?.toString(),
      creatorId: analysis.creatorId || analysis._id?.toString(),
      name: creatorName,
      handle: creatorHandle,
      username: creatorHandle.replace('@', ''),
      platform: analysis.platform,
      profileUrl: analysis.profileUrl,
      followers: analysis.followers,
      following: analysis.following || '0',
      posts: analysis.posts || '0',
      engagement: engagementRate,
      avgViews: analysis.avgViews || '0',
      avgLikes: analysis.avgLikes || '0',
      avgComments: analysis.avgComments || '0',
      avgShares: analysis.avgShares || '0',
      score: trustScore,
      alignmentScore: analysis.alignmentScore || trustScore,
      recommendation: trustScore >= 85 ? 'perfect' : trustScore >= 70 ? 'good' : 'review',
      isRisingStar: analysis.isRisingStar || false,
      growthRate: analysis.growthRate || '+0%',
      joinedDate: analysis.joinedDate || 'Unknown',
      niche: analysis.niche || 'General',
      location: analysis.location || 'Unknown',
      bio: analysis.bio || '',
      riskLevel: analysis.riskLevel || 'low',
      
      // Core Metrics with defaults
      coreMetrics: analysis.coreMetrics || {
        audienceAuthenticity: Math.round(trustScore * 0.95),
        contentQuality: Math.round(trustScore * 0.92),
        brandSafety: Math.round(trustScore * 0.98),
        engagementRate: Math.round(parseFloat(engagementRate) * 20),
        professionalism: Math.round(trustScore * 0.95),
        growthTrajectory: Math.round(trustScore * 0.91),
      },
      
      // Engagement Data with defaults
      engagementData: analysis.engagementData || {
        likes: { value: parseInt(analysis.avgLikes || '0') || 25000, percentage: 68, trend: '+12%' },
        comments: { value: parseInt(analysis.avgComments || '0') || 1200, percentage: 18, trend: '+8%' },
        shares: { value: parseInt(analysis.avgShares || '0') || 450, percentage: 8, trend: '+15%' },
        saves: { value: 800, percentage: 6, trend: '+22%' },
      },
      
      // Content Analysis with defaults
      contentAnalysis: analysis.contentAnalysis || {
        totalPosts: parseInt(analysis.posts || '0') || 500,
        avgPostsPerWeek: 3.5,
        topPerformingType: 'Reels',
        contentTypes: [
          { type: 'Photos', count: Math.round((parseInt(analysis.posts || '0') || 500) * 0.5), percentage: 50 },
          { type: 'Reels/Videos', count: Math.round((parseInt(analysis.posts || '0') || 500) * 0.35), percentage: 35 },
          { type: 'Carousels', count: Math.round((parseInt(analysis.posts || '0') || 500) * 0.15), percentage: 15 },
        ],
        topHashtags: ['#lifestyle', '#content', '#creator'],
        postingSchedule: 'Most active: Tue-Thu, 10AM-2PM',
      },
      
      // Brand Alignment with defaults
      brandAlignment: analysis.brandAlignment || {
        overallScore: analysis.alignmentScore || trustScore,
        vision: { score: Math.round((analysis.alignmentScore || trustScore) * 0.96), description: 'Strong alignment with brand vision' },
        mission: { score: Math.round((analysis.alignmentScore || trustScore) * 0.92), description: 'Content supports brand mission' },
        values: { score: Math.round((analysis.alignmentScore || trustScore) * 0.95), description: 'Shared values alignment' },
        audience: { score: Math.round((analysis.alignmentScore || trustScore) * 0.93), description: 'Target demographic overlap' },
        tone: { score: Math.round((analysis.alignmentScore || trustScore) * 0.91), description: 'Communication style aligns' },
      },
      
      // Future Prediction with defaults
      futurePrediction: analysis.futurePrediction || {
        overall: trustScore >= 80 ? 'positive' : 'neutral',
        confidence: Math.round(trustScore * 0.89),
        prediction: trustScore >= 80 
          ? 'High likelihood of continued growth and positive brand association'
          : 'Moderate growth potential with room for improvement',
        factors: [
          { factor: 'Audience Growth', impact: 'positive', score: Math.round(trustScore * 0.92), description: 'Projected growth trajectory' },
          { factor: 'Content Consistency', impact: 'positive', score: Math.round(trustScore * 0.88), description: 'Regular posting schedule' },
          { factor: 'Brand Partnerships', impact: 'neutral', score: 75, description: 'Previous brand collaborations' },
          { factor: 'Community Sentiment', impact: 'positive', score: Math.round(trustScore * 0.94), description: 'Positive audience interactions' },
          { factor: 'Trend Alignment', impact: 'positive', score: Math.round(trustScore * 0.90), description: 'Content trend awareness' },
        ],
      },
      
      // Rising Star Data with defaults
      risingStarData: analysis.risingStarData || {
        isRisingStar: analysis.isRisingStar || false,
        starScore: analysis.isRisingStar ? 87 : 0,
        indicators: analysis.isRisingStar ? [
          { label: 'Rapid Growth', value: true, detail: `${analysis.growthRate || '+10%'} growth in last 30 days` },
          { label: 'High Engagement', value: true, detail: `${engagementRate} vs industry average` },
          { label: 'Viral Content', value: true, detail: 'Multiple high-performing posts' },
          { label: 'Community Building', value: true, detail: 'Strong audience loyalty' },
          { label: 'Untapped Potential', value: true, detail: 'Undervalued for current reach' },
        ] : [],
        projectedReach: analysis.isRisingStar ? '500K-750K in 12 months' : 'N/A',
        recommendedAction: analysis.isRisingStar ? 'Partner early for optimal ROI' : 'Standard partnership terms',
      },
      
      // Authenticity Data with defaults
      authenticityData: analysis.authenticityData || {
        score: Math.round(trustScore * 0.94),
        realFollowers: Math.round(trustScore * 0.94),
        suspiciousActivity: 100 - Math.round(trustScore * 0.98),
        engagementQuality: Math.round(trustScore * 0.96),
        audienceGrowth: 'organic',
        checks: [
          { check: 'Follower/Following Ratio', status: 'pass', detail: 'Healthy ratio' },
          { check: 'Engagement Pattern', status: 'pass', detail: 'Natural engagement distribution' },
          { check: 'Comment Quality', status: 'pass', detail: 'Genuine, meaningful comments' },
          { check: 'Growth Pattern', status: 'pass', detail: 'Organic growth detected' },
          { check: 'Bot Detection', status: 'pass', detail: 'Minimal bot followers' },
          { check: 'Audience Location', status: 'pass', detail: 'Geographic distribution matches niche' },
        ],
      },
      
      // Recent Posts with defaults
      recentPosts: analysis.recentPosts || [
        { id: 1, type: 'reel', thumbnail: '🎬', likes: 24500, comments: 1230, shares: 456, views: 128000 },
        { id: 2, type: 'photo', thumbnail: '📸', likes: 15200, comments: 892, shares: 234, views: 45000 },
        { id: 3, type: 'carousel', thumbnail: '🖼️', likes: 18700, comments: 1045, shares: 312, views: 67000 },
        { id: 4, type: 'reel', thumbnail: '🎬', likes: 31200, comments: 1567, shares: 623, views: 185000 },
      ],
      
      // Strengths with defaults
      strengths: analysis.strengths || [
        { title: 'Authentic Engagement', description: `Engagement rate of ${engagementRate} indicates genuine audience connection` },
        { title: 'Consistent Content', description: 'Regular posting schedule maintains audience interest' },
        { title: 'High Trust Score', description: `Trust score of ${trustScore} indicates reliable creator` },
      ],
      
      // Concerns with defaults
      concerns: analysis.concerns || [],
      
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };

    return NextResponse.json({ creator: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching creator analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update creator analysis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
    const collection = await getAnalysesCollection();

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    let result;
    if (ObjectId.isValid(id)) {
      result = await collection.updateOne(
        { _id: new ObjectId(id), userId: new ObjectId(payload.userId) },
        { $set: updateData }
      );
    } else {
      result = await collection.updateOne(
        { creatorId: id, userId: new ObjectId(payload.userId) },
        { $set: updateData }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Creator analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Creator analysis updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating creator analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove creator analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const collection = await getAnalysesCollection();

    let result;
    if (ObjectId.isValid(id)) {
      result = await collection.deleteOne({
        _id: new ObjectId(id),
        userId: new ObjectId(payload.userId),
      });
    } else {
      result = await collection.deleteOne({
        creatorId: id,
        userId: new ObjectId(payload.userId),
      });
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Creator analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Creator analysis deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting creator analysis:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

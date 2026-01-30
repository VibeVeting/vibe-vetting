import { NextRequest, NextResponse } from "next/server";
import { BarterUserModel } from "@/lib/models/barter-user";
import { verifyToken } from "@/lib/auth";

// GET - Get all barter creators for company to discover
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const niche = searchParams.get('niche');
    const platform = searchParams.get('platform');
    const minFollowers = searchParams.get('minFollowers');
    const maxFollowers = searchParams.get('maxFollowers');
    const search = searchParams.get('search');

    // Fetch all barter creators
    const allCreators = await BarterUserModel.findAll();

    // Parse follower count string to number for comparison
    const parseFollowerCount = (count: string): number => {
      if (!count) return 0;
      const lower = count.toLowerCase().trim();
      
      // Handle ranges like "10K-50K"
      if (lower.includes('-')) {
        const parts = lower.split('-');
        const firstPart = parts[0].trim();
        if (firstPart.endsWith('k')) {
          return parseFloat(firstPart.replace('k', '')) * 1000;
        } else if (firstPart.endsWith('m')) {
          return parseFloat(firstPart.replace('m', '')) * 1000000;
        }
        return parseFloat(firstPart) || 0;
      }
      
      // Handle single values like "50K" or "1M"
      if (lower.endsWith('k')) {
        return parseFloat(lower.replace('k', '')) * 1000;
      } else if (lower.endsWith('m')) {
        return parseFloat(lower.replace('m', '')) * 1000000;
      }
      
      return parseFloat(lower.replace(/,/g, '')) || 0;
    };

    // Get the max follower count from range for display
    const getMaxFollowerCount = (count: string): number => {
      if (!count) return 0;
      const lower = count.toLowerCase().trim();
      
      if (lower.includes('-')) {
        const parts = lower.split('-');
        const lastPart = parts[parts.length - 1].trim();
        if (lastPart.endsWith('k')) {
          return parseFloat(lastPart.replace('k', '')) * 1000;
        } else if (lastPart.endsWith('m')) {
          return parseFloat(lastPart.replace('m', '')) * 1000000;
        }
        return parseFloat(lastPart) || 0;
      }
      
      return parseFollowerCount(count);
    };

    // Filter creators
    let filteredCreators = allCreators.filter(creator => {
      // Filter by niche
      if (niche && niche !== 'all') {
        if (!creator.creatorProfile?.niche?.toLowerCase().includes(niche.toLowerCase())) {
          return false;
        }
      }

      // Filter by platform
      if (platform && platform !== 'all') {
        if (creator.creatorProfile?.primaryPlatform?.toLowerCase() !== platform.toLowerCase()) {
          return false;
        }
      }

      // Filter by min followers
      if (minFollowers) {
        const creatorFollowers = parseFollowerCount(creator.creatorProfile?.followerCount || '0');
        if (creatorFollowers < parseInt(minFollowers)) {
          return false;
        }
      }

      // Filter by max followers
      if (maxFollowers) {
        const creatorFollowers = getMaxFollowerCount(creator.creatorProfile?.followerCount || '0');
        if (creatorFollowers > parseInt(maxFollowers)) {
          return false;
        }
      }

      // Search by name or handle
      if (search) {
        const searchLower = search.toLowerCase();
        const nameMatch = creator.name?.toLowerCase().includes(searchLower);
        const handleMatch = Object.values(creator.creatorProfile?.socialHandles || {})
          .some(handle => handle?.toLowerCase().includes(searchLower));
        const nicheMatch = creator.creatorProfile?.niche?.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !handleMatch && !nicheMatch) {
          return false;
        }
      }

      return true;
    });

    // Sort by follower count (highest first)
    filteredCreators.sort((a, b) => {
      const aFollowers = parseFollowerCount(a.creatorProfile?.followerCount || '0');
      const bFollowers = parseFollowerCount(b.creatorProfile?.followerCount || '0');
      return bFollowers - aFollowers;
    });

    // Map to response format
    const creators = filteredCreators.map(creator => ({
      id: creator._id!.toString(),
      name: creator.name,
      email: creator.email,
      niche: creator.creatorProfile?.niche || 'General',
      primaryPlatform: creator.creatorProfile?.primaryPlatform || 'instagram',
      followerCount: creator.creatorProfile?.followerCount || '0',
      followerCountNum: parseFollowerCount(creator.creatorProfile?.followerCount || '0'),
      socialHandles: creator.creatorProfile?.socialHandles || {},
      city: creator.creatorProfile?.city || '',
      barterReady: creator.creatorProfile?.barterReady ?? true,
      whyBarter: creator.creatorProfile?.whyBarter || '',
      createdAt: creator.createdAt,
    }));

    // Get unique niches and platforms for filter options
    const niches = [...new Set(allCreators.map(c => c.creatorProfile?.niche).filter(Boolean))];
    const platforms = [...new Set(allCreators.map(c => c.creatorProfile?.primaryPlatform).filter(Boolean))];

    return NextResponse.json({
      creators,
      total: creators.length,
      filterOptions: {
        niches,
        platforms,
      }
    });
  } catch (error) {
    console.error("Get barter creators error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

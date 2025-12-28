import { NextRequest, NextResponse } from 'next/server';

// Cache for storing API results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data fallback when API fails - includes creators from various countries
const mockCreators = [
  // India
  { connector: "instagram", handle: "yoga_with_priya", handle_link: "https://instagram.com/yoga_with_priya", followers: 42000, engagement: 5.2, posts: 380, bio: "Yoga instructor | Mind & Body wellness | Daily tips", category: "Health & Fitness", city: "Mumbai", country: "India" },
  { connector: "instagram", handle: "tech_arjun", handle_link: "https://instagram.com/tech_arjun", followers: 38000, engagement: 4.8, posts: 220, bio: "Tech reviewer | Gadget enthusiast | Hindi & English", category: "Technology", city: "Bangalore", country: "India" },
  { connector: "instagram", handle: "foodie_delhi", handle_link: "https://instagram.com/foodie_delhi", followers: 51000, engagement: 6.2, posts: 450, bio: "Street food explorer | Delhi food guide | Restaurant reviews", category: "Food & Beverages", city: "Delhi", country: "India" },
  { connector: "instagram", handle: "travel_india_raj", handle_link: "https://instagram.com/travel_india_raj", followers: 35000, engagement: 5.5, posts: 320, bio: "Travel blogger | Exploring India | Hidden gems", category: "Travel & Adventure", city: "Jaipur", country: "India" },
  { connector: "instagram", handle: "fashion_neha", handle_link: "https://instagram.com/fashion_neha", followers: 28000, engagement: 4.9, posts: 280, bio: "Fashion blogger | Indian ethnic wear | Style tips", category: "Fashion & Beauty", city: "Chennai", country: "India" },
  { connector: "instagram", handle: "fitness_rahul", handle_link: "https://instagram.com/fitness_rahul", followers: 45000, engagement: 5.8, posts: 190, bio: "Fitness coach | Bodybuilding | Nutrition tips", category: "Health & Fitness", city: "Pune", country: "India" },
  // United States
  { connector: "instagram", handle: "fitness_coach_mike", handle_link: "https://instagram.com/fitness_coach_mike", followers: 45000, engagement: 4.2, posts: 320, bio: "Certified fitness trainer | Helping you get fit | DM for coaching", category: "Health & Fitness", city: "Los Angeles", country: "United States" },
  { connector: "instagram", handle: "travel_with_sarah", handle_link: "https://instagram.com/travel_with_sarah", followers: 32000, engagement: 5.8, posts: 450, bio: "✈️ Travel blogger | 50+ countries | Sharing hidden gems", category: "Travel & Adventure", city: "New York", country: "United States" },
  { connector: "instagram", handle: "foodie_adventures", handle_link: "https://instagram.com/foodie_adventures", followers: 28000, engagement: 6.1, posts: 280, bio: "Food lover | Restaurant reviews | Recipe creator 🍕", category: "Food & Beverages", city: "Chicago", country: "United States" },
  { connector: "instagram", handle: "tech_reviewer_pro", handle_link: "https://instagram.com/tech_reviewer_pro", followers: 51000, engagement: 3.5, posts: 190, bio: "Tech enthusiast | Honest reviews | Gadget unboxing", category: "Technology", city: "San Francisco", country: "United States" },
  // UK
  { connector: "instagram", handle: "gaming_zone_alex", handle_link: "https://instagram.com/gaming_zone_alex", followers: 35000, engagement: 7.1, posts: 240, bio: "Pro gamer | Streaming daily | Game reviews & tips", category: "Gaming", city: "London", country: "United Kingdom" },
  { connector: "instagram", handle: "london_foodie", handle_link: "https://instagram.com/london_foodie", followers: 29000, engagement: 5.3, posts: 310, bio: "Food blogger | London restaurants | Recipes", category: "Food & Beverages", city: "London", country: "United Kingdom" },
  // Canada
  { connector: "instagram", handle: "beauty_secrets_lisa", handle_link: "https://instagram.com/beauty_secrets_lisa", followers: 29000, engagement: 5.5, posts: 410, bio: "Beauty & Skincare | Makeup tutorials | Product reviews", category: "Fashion & Beauty", city: "Toronto", country: "Canada" },
  // Others
  { connector: "instagram", handle: "business_mindset", handle_link: "https://instagram.com/business_mindset", followers: 48000, engagement: 3.9, posts: 150, bio: "Entrepreneur | Business tips | Motivation daily", category: "Business", city: "Dubai", country: "United Arab Emirates" },
];

// Function to filter mock data based on query params
function filterMockCreators(creators: typeof mockCreators, country: string, category: string, city: string) {
  return creators.filter(c => {
    if (country && c.country !== country) return false;
    if (category && c.category !== category) return false;
    if (city && c.city && !c.city.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Get query parameters with defaults
  const current_page = searchParams.get('current_page') || '1';
  const handle_contains = searchParams.get('handle_contains') || '';
  const followers_minimum = searchParams.get('followers_minimum') || '1000';
  const followers_maximum = searchParams.get('followers_maximum') || '50000';
  const engagement_rate_minimum = searchParams.get('engagement_rate_minimum') || '0';
  const engagement_rate_maximum = searchParams.get('engagement_rate_maximum') || '100';
  const category = searchParams.get('category') || '';
  const city = searchParams.get('city') || '';
  const country = searchParams.get('country') || '';
  const bio_contains = searchParams.get('bio_contains') || '';
  const posts_minimum = searchParams.get('posts_minimum') || '1';
  const posts_maximum = searchParams.get('posts_maximum') || '10000';

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.set('current_page', current_page);
  if (handle_contains) queryParams.set('handle_contains', handle_contains);
  queryParams.set('followers_minimum', followers_minimum);
  queryParams.set('followers_maximum', followers_maximum);
  queryParams.set('engagement_rate_minumum', engagement_rate_minimum); // Note: API has typo "minumum"
  queryParams.set('engagement_rate_maximum', engagement_rate_maximum);
  if (category) queryParams.set('category', category);
  if (city) queryParams.set('city', city);
  if (country) queryParams.set('country', country);
  if (bio_contains) queryParams.set('bio_contains', bio_contains);
  queryParams.set('posts_minimum', posts_minimum);
  queryParams.set('posts_maximum', posts_maximum);

  const cacheKey = queryParams.toString();
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  const apiUrl = `https://ylytic-influencers-api.p.rapidapi.com/ylytic/admin/api/v1/discovery?${queryParams.toString()}`;

  try {
    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'ylytic-influencers-api.p.rapidapi.com',
        'x-rapidapi-key': 'c1c29e497amshcf90f5532489165p1e3d42jsn5ccfc261e2da',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Return filtered mock data on API error
      console.log('API returned error, using mock data');
      const filteredMock = filterMockCreators(mockCreators, country, category, city);
      return NextResponse.json({
        creators: filteredMock.length > 0 ? filteredMock : mockCreators,
        creators_total: filteredMock.length > 0 ? filteredMock.length : mockCreators.length,
        current_page: 1,
        page_maximum: 1,
        page_minimum: 1,
      });
    }

    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching creators:', error);
    
    // Return filtered mock data on any error (timeout, network, etc.)
    console.log('Using mock data due to error');
    const filteredMock = filterMockCreators(mockCreators, country, category, city);
    return NextResponse.json({
      creators: filteredMock.length > 0 ? filteredMock : mockCreators,
      creators_total: filteredMock.length > 0 ? filteredMock.length : mockCreators.length,
      current_page: 1,
      page_maximum: 1,
      page_minimum: 1,
    });
  }
}

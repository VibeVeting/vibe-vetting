import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = 'cb0d9b139cmsh8cc0f7dd1003172p1754d6jsna25db00e76ac';

// Step 1: Search Google for LinkedIn profiles
async function searchGoogleForLinkedIn(query: string, limit: number = 10) {
  const searchQuery = `site:linkedin.com/in ${query}`;
  const url = `https://google-search74.p.rapidapi.com/?query=${encodeURIComponent(searchQuery)}&limit=${limit}&related_keywords=true`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'google-search74.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Google search failed with status ${response.status}`);
  }

  return response.json();
}

// Step 2: Extract LinkedIn profile URLs from Google results
function extractLinkedInUrls(googleResults: any): string[] {
  const urls: string[] = [];
  
  // Handle different response structures
  const results = googleResults.results || googleResults.organic || googleResults.data || [];
  
  for (const result of results) {
    const url = result.url || result.link || result.href || '';
    if (url.includes('linkedin.com/in/')) {
      urls.push(url);
    }
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

// Step 3: Get detailed profile data using LinkedIn URL
async function getLinkedInProfileByUrl(linkedInSearchUrl: string) {
  const url = 'https://professional-network-data.p.rapidapi.com/search-people-by-url';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'professional-network-data.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
    body: JSON.stringify({ url: linkedInSearchUrl }),
  });

  if (!response.ok) {
    throw new Error(`LinkedIn profile fetch failed with status ${response.status}`);
  }

  return response.json();
}

// Build LinkedIn search URL from filters
function buildLinkedInSearchUrl(filters: {
  keywords?: string;
  industry?: string;
  location?: string;
  followerRange?: string;
}) {
  const params = new URLSearchParams();
  
  if (filters.keywords) {
    params.append('keywords', filters.keywords);
  }
  
  // Map industry to LinkedIn industry codes (simplified)
  const industryMap: Record<string, string> = {
    'technology': '96',
    'marketing': '80',
    'fashion': '19',
    'beauty': '48',
    'fitness': '102',
    'finance': '43',
    'healthcare': '14',
    'education': '67',
    'entertainment': '28',
    'food': '34',
    'travel': '30',
    'retail': '27',
    'media': '35',
  };
  
  // Map location to geo URN codes (simplified)
  const locationMap: Record<string, string> = {
    'india': '102713980',
    'usa': '103644278',
    'uk': '101165590',
    'canada': '101174742',
    'australia': '101452733',
    'germany': '101282230',
    'france': '105015875',
    'singapore': '102454443',
    'uae': '104305776',
    'brazil': '106057199',
  };
  
  if (filters.industry && industryMap[filters.industry.toLowerCase()]) {
    params.append('industry', `["${industryMap[filters.industry.toLowerCase()]}"]`);
  }
  
  if (filters.location && locationMap[filters.location.toLowerCase()]) {
    params.append('geoUrn', `["${locationMap[filters.location.toLowerCase()]}"]`);
  }
  
  params.append('origin', 'FACETED_SEARCH');
  
  return `https://www.linkedin.com/search/results/people/?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, location, followerRange, keywords } = body;

    if (!keywords && !industry && !location && !followerRange) {
      return NextResponse.json({
        success: false,
        error: 'Please provide at least one search criteria',
      }, { status: 400 });
    }

    // Build the search query for Google - FOLLOWER COUNT IS THE PRIMARY FOCUS
    // ALWAYS search for creators/influencers only
    let googleQuery = 'site:linkedin.com/in (creator OR influencer OR "content creator" OR blogger OR vlogger OR "brand ambassador" OR "social media")';
    
    // Follower count/size is the MOST CRITICAL filter - add it FIRST with maximum emphasis
    if (followerRange) {
      const followerSearchTerms: Record<string, string[]> = {
        'nano': [
          '"1K followers"',
          '"2K followers"',
          '"5K followers"',
          '"10K followers"',
          'nano influencer',
          'micro creator',
          '"1000 followers"',
          '"5000 followers"',
        ],
        'micro': [
          '"10K followers"',
          '"20K followers"',
          '"30K followers"',
          '"50K followers"',
          'micro influencer',
          '"10000 followers"',
          '"25000 followers"',
          '"50000 followers"',
        ],
        'mid': [
          '"100K followers"',
          '"200K followers"',
          '"500K followers"',
          'influencer',
          'content creator',
          '"100000 followers"',
          '"250000 followers"',
        ],
        'macro': [
          '"500K followers"',
          '"750K followers"',
          '"1M followers"',
          'macro influencer',
          'top creator',
          '"500000 followers"',
          '"million followers"',
        ],
        'mega': [
          '"1M followers"',
          '"2M followers"',
          '"5M followers"',
          '"10M followers"',
          'celebrity',
          'mega influencer',
          '"million followers"',
          'famous',
          'top influencer',
        ],
      };
      
      const terms = followerSearchTerms[followerRange.toLowerCase()];
      if (terms) {
        // Use OR operator to search for any of these follower counts
        googleQuery += ` (${terms.slice(0, 4).join(' OR ')})`;
      }
    }
    
    // Add keywords after follower count
    if (keywords) {
      googleQuery += ` ${keywords}`;
    }
    
    // Add industry context
    if (industry) {
      const industryTerms: Record<string, string> = {
        'technology': 'tech software developer engineer startup',
        'marketing': 'marketing digital marketing brand strategist',
        'fashion': 'fashion style designer model clothing',
        'beauty': 'beauty cosmetics makeup skincare',
        'fitness': 'fitness health wellness trainer gym',
        'finance': 'finance fintech investor trading crypto',
        'healthcare': 'healthcare medical doctor nurse health',
        'education': 'education teaching professor trainer',
        'entertainment': 'entertainment media actor creator',
        'food': 'food chef restaurant culinary',
        'travel': 'travel tourism blogger explorer',
        'retail': 'retail ecommerce shopping brand',
        'media': 'media journalist content creator',
      };
      googleQuery += ` ${industryTerms[industry.toLowerCase()] || industry}`;
    }
    
    // Add location
    if (location) {
      const locationTerms: Record<string, string> = {
        'india': 'India Mumbai Delhi Bangalore',
        'usa': 'USA United States New York Los Angeles',
        'uk': 'UK United Kingdom London',
        'canada': 'Canada Toronto Vancouver',
        'australia': 'Australia Sydney Melbourne',
        'germany': 'Germany Berlin Munich',
        'france': 'France Paris',
        'singapore': 'Singapore',
        'uae': 'UAE Dubai Abu Dhabi',
        'brazil': 'Brazil São Paulo Rio',
      };
      googleQuery += ` ${locationTerms[location.toLowerCase()] || location}`;
    }

    // Step 1: Search Google for LinkedIn profiles
    console.log('Searching Google for:', googleQuery);
    const googleResults = await searchGoogleForLinkedIn(googleQuery, 15);
    
    // Step 2: Extract LinkedIn URLs
    const linkedInUrls = extractLinkedInUrls(googleResults);
    console.log('Found LinkedIn URLs:', linkedInUrls.length);

    // Step 3: Build LinkedIn search URL from filters
    const linkedInSearchUrl = buildLinkedInSearchUrl({
      keywords,
      industry,
      location,
      followerRange,
    });

    // Step 4: Try to get detailed profiles using the search URL
    let detailedProfiles: any[] = [];
    
    try {
      const profileData = await getLinkedInProfileByUrl(linkedInSearchUrl);
      if (profileData && (profileData.items || profileData.results || profileData.data)) {
        detailedProfiles = profileData.items || profileData.results || profileData.data || [];
      }
    } catch (err) {
      console.log('Direct LinkedIn search failed, using Google results:', err);
    }

    // Combine results - prefer detailed profiles, fall back to Google results
    const profiles = detailedProfiles.length > 0 
      ? detailedProfiles.map((p: any) => ({
          id: p.id || p.urn || Math.random().toString(36).substr(2, 9),
          fullName: p.fullName || p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
          headline: p.headline || p.title || '',
          location: p.location || p.geoLocation || '',
          profileUrl: p.profileUrl || p.linkedinUrl || p.url || '',
          profilePicture: p.profilePicture || p.picture || p.photo || '',
          industry: p.industry || industry || '',
          connectionDegree: p.connectionDegree || p.degree || '',
          summary: p.summary || p.about || '',
          followers: p.followersCount || p.followers || '',
        }))
      : linkedInUrls.map((url, index) => {
          // Extract name from URL if possible
          const urlParts = url.split('/in/');
          const slug = urlParts[1]?.split('/')[0]?.split('?')[0] || '';
          const name = slug.replace(/-/g, ' ').replace(/\d+/g, '').trim();
          
          return {
            id: `google-${index}`,
            fullName: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'LinkedIn User',
            headline: googleResults.results?.[index]?.description || '',
            location: location || '',
            profileUrl: url,
            profilePicture: '',
            industry: industry || '',
            connectionDegree: '',
            summary: googleResults.results?.[index]?.snippet || '',
            followers: '',
          };
        });

    return NextResponse.json({
      success: true,
      query: {
        keywords,
        industry,
        location,
        followerRange,
      },
      linkedInSearchUrl,
      totalResults: profiles.length,
      profiles,
      googleResults: googleResults.results || [],
    });
  } catch (error) {
    console.error('Creator search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search for creators',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

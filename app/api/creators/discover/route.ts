import { NextRequest, NextResponse } from 'next/server';

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

  const apiUrl = `https://ylytic-influencers-api.p.rapidapi.com/ylytic/admin/api/v1/discovery?${queryParams.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'ylytic-influencers-api.p.rapidapi.com',
        'x-rapidapi-key': 'c1c29e497amshcf90f5532489165p1e3d42jsn5ccfc261e2da',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch creators', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching creators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch creators. Please try again later.' },
      { status: 500 }
    );
  }
}

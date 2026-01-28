import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = 'cb0d9b139cmsh8cc0f7dd1003172p1754d6jsna25db00e76ac';
const RAPIDAPI_HOST = 'professional-network-data.p.rapidapi.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords') || '';
    const geo = searchParams.get('geo') || '103644278,101165590'; // Default: India, USA
    const start = searchParams.get('start') || '0';

    if (!keywords) {
      return NextResponse.json({
        success: false,
        error: 'Keywords are required',
      }, { status: 400 });
    }

    const url = `https://professional-network-data.p.rapidapi.com/search-people?geo=${encodeURIComponent(geo)}&keywords=${encodeURIComponent(keywords)}&start=${start}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data: data,
      total: data.total || 0,
      results: data.items || data.results || data.data || [],
    });
  } catch (error) {
    console.error('LinkedIn search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search LinkedIn profiles',
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { CompanyModel, Company } from '@/lib/models';

// OpenAI API integration for brand insights
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface BrandInsights {
  summary: string;
  marketPosition: string;
  brandPersonality: string[];
  targetAudience: string;
  competitiveAdvantage: string;
  growthOpportunities: string[];
  recommendedCreatorTypes: string[];
  brandVoice: string;
  keyStrengths: string[];
}

async function generateBrandInsights(company: Company): Promise<BrandInsights> {
  const prompt = `Analyze this company and provide detailed brand insights for influencer marketing purposes:

Company: ${company.companyName}
Industry: ${company.industry || 'Not specified'}
Location: ${company.location || 'Not specified'}, ${company.continent || ''}
Employee Range: ${company.employee_range || 'Not specified'}
Revenue Range: ${company.revenue_range || 'Not specified'}
Total Funding: ${company.total_funding_amount_usd ? `$${company.total_funding_amount_usd.toLocaleString()}` : 'Not disclosed'}
Last Funding Date: ${company.last_funding_date || 'Not specified'}
Funding Type: ${company.last_equity_funding_type || company.last_funding_type || 'Not specified'}

Provide a JSON response with these fields:
- summary: A compelling 2-3 sentence overview of the brand
- marketPosition: Their position in the market (leader, challenger, niche player, etc.)
- brandPersonality: Array of 4-5 personality traits
- targetAudience: Description of their ideal customer
- competitiveAdvantage: What makes them unique
- growthOpportunities: Array of 3-4 growth opportunities
- recommendedCreatorTypes: Array of 4-5 creator types that would fit well
- brandVoice: Description of their brand voice/tone
- keyStrengths: Array of 3-4 key business strengths`;

  if (!OPENAI_API_KEY) {
    // Return mock insights for demo
    return getMockInsights(company);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a brand strategy expert specializing in influencer marketing. Provide insightful, actionable brand analysis in JSON format only.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return getMockInsights(company);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getMockInsights(company);
  }
}

function getMockInsights(company: Company): BrandInsights {
  return {
    summary: `${company.companyName} is a dynamic ${company.industry || 'technology'} company based in ${company.location || 'global markets'}. With ${company.employee_range || 'a growing'} team, they are positioned for significant growth in their sector.`,
    marketPosition: company.total_funding_amount_usd && company.total_funding_amount_usd > 10000000 
      ? 'Emerging Market Leader' 
      : company.total_funding_amount_usd && company.total_funding_amount_usd > 1000000 
        ? 'Growth Stage Challenger' 
        : 'Innovative Disruptor',
    brandPersonality: ['Innovative', 'Authentic', 'Customer-Centric', 'Forward-Thinking', 'Trustworthy'],
    targetAudience: `Tech-savvy professionals and early adopters in the ${company.industry || 'technology'} space, ages 25-45, who value innovation and quality.`,
    competitiveAdvantage: `Strong market presence in ${company.region || 'their region'} with proven track record and ${company.total_funding_amount_usd ? 'solid financial backing' : 'lean operations'}.`,
    growthOpportunities: [
      'Expand influencer partnerships in emerging markets',
      'Leverage micro-influencers for authentic engagement',
      'Build long-term creator relationships for brand advocacy',
      'Explore new content formats like short-form video'
    ],
    recommendedCreatorTypes: [
      'Industry thought leaders',
      'Tech reviewers and early adopters',
      'Lifestyle influencers with professional audience',
      'B2B content creators',
      'Micro-influencers in niche communities'
    ],
    brandVoice: 'Professional yet approachable, innovative without being intimidating, and focused on delivering real value.',
    keyStrengths: [
      `${company.last_equity_funding_type ? 'Strong investor confidence' : 'Bootstrapped resilience'}`,
      `${company.employee_range ? 'Scalable team structure' : 'Agile operations'}`,
      `${company.industry || 'Technology'} expertise`,
      'Market adaptability'
    ]
  };
}

// GET - Fetch company by name or ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    const withInsights = searchParams.get('insights') === 'true';

    if (!name && !id) {
      return NextResponse.json(
        { error: 'Company name or ID is required' },
        { status: 400 }
      );
    }

    let company: Company | null = null;

    if (id) {
      company = await CompanyModel.findById(id);
    } else if (name) {
      // First try exact match
      company = await CompanyModel.findByName(name);
      
      // If no exact match, try search
      if (!company) {
        const results = await CompanyModel.search(name);
        if (results.length > 0) {
          company = results[0];
        }
      }
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found', searchedFor: name || id },
        { status: 404 }
      );
    }

    // Generate AI insights if requested
    if (withInsights) {
      const insights = await generateBrandInsights(company);
      return NextResponse.json({
        success: true,
        company,
        insights
      });
    }

    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Company API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

// POST - Create or update company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, ...companyData } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const company = await CompanyModel.upsertByName(companyName, companyData);
    
    return NextResponse.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Company API error:', error);
    return NextResponse.json(
      { error: 'Failed to create/update company' },
      { status: 500 }
    );
  }
}

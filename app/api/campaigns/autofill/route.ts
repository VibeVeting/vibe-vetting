import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { companyName, productName, websiteUrl } = await request.json();

    if (!companyName || !productName) {
      return NextResponse.json(
        { error: 'Company name and product name are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert marketing strategist. Based on the following company and product information, generate a comprehensive influencer marketing campaign configuration.

Company Name: ${companyName}
Product Name: ${productName}
Website: ${websiteUrl || 'Not provided'}

Generate a JSON response with the following fields (use exact field names and valid values from the options provided):

{
  "name": "A catchy campaign name (string)",
  "description": "A detailed campaign description including objectives, target audience, and key messages (2-3 paragraphs)",
  "industry": "One of: fashion, tech, fitness, food, travel, gaming, finance, education, automotive, home",
  "budget": "One of: 500-1000, 1000-5000, 5000-10000, 10000-25000, 25000-50000, 50000-100000, 100000+",
  "platforms": ["Array of: Instagram, YouTube, TikTok, Twitter, LinkedIn, Facebook"],
  "followerRange": "One of: nano, micro, mid, macro, mega",
  "engagementRate": "One of: 1, 2, 3, 5",
  "audienceAge": ["Array of: 13-17, 18-24, 25-34, 35-44, 45-54, 55+"],
  "audienceGender": "One of: any, male, female",
  "audienceLocation": ["Array of relevant countries/regions like: United States, India, United Kingdom, Canada, etc."],
  "contentType": ["Array of: photo, video, reel, story, live, blog"],
  "contentStyle": "One of: professional, casual, educational, entertaining, inspirational",
  "postingFrequency": "One of: one-time, weekly, bi-weekly, monthly",
  "minTrustScore": "One of: 50, 60, 70, 80, 90",
  "maxRiskLevel": "One of: low, medium, high",
  "brandValues": ["Array of: authenticity, creativity, diversity, sustainability, innovation, quality, community, transparency"],
  "excludeCategories": ["Array of any that should be excluded: politics, adult, gambling, alcohol, tobacco, competitors, crypto"],
  "deliverables": "One of: 1-3, 4-6, 7-10, 10+"
}

Analyze the company/product to determine the best values. Be smart about platform selection, target audience, and budget based on the type of product. Return ONLY valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing expert that generates campaign configurations. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // Parse the JSON response
    let campaignData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      campaignData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaignData,
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate campaign data' },
      { status: 500 }
    );
  }
}

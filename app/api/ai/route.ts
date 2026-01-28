import { NextRequest, NextResponse } from 'next/server';

// OpenAI API integration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function callOpenAI(messages: { role: string; content: string }[], maxTokens = 500) {
  if (!OPENAI_API_KEY) {
    // Return mock responses for demo/development
    return getMockResponse(messages[messages.length - 1].content);
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
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return getMockResponse(messages[messages.length - 1].content);
  }
}

function getMockResponse(prompt: string): string {
  // Mock responses for different AI features
  if (prompt.includes('bio') || prompt.includes('creator profile')) {
    return JSON.stringify({
      niche: 'Lifestyle & Fashion',
      tone: 'Friendly and aspirational',
      brandFit: 85,
      strengths: ['Strong visual aesthetic', 'Consistent posting schedule', 'High engagement captions'],
      concerns: ['Limited product review experience'],
      recommendation: 'Great fit for fashion, beauty, and lifestyle brands targeting young professionals.'
    });
  }
  
  if (prompt.includes('outreach email') || prompt.includes('collaboration email')) {
    return `Subject: Exciting Collaboration Opportunity with [Brand Name]

Hi [Creator Name],

I've been following your content and absolutely love your authentic approach to [niche]. Your recent post about [specific content] really resonated with our brand values.

We're [Brand Name], and we're looking for creators who share our passion for [brand value]. We believe your audience would love what we offer.

Would you be interested in exploring a collaboration? We're thinking:
• [Deliverable 1]
• [Deliverable 2]
• Competitive compensation + free products

Let me know if you'd like to chat!

Best,
[Your Name]`;
  }

  if (prompt.includes('find similar') || prompt.includes('similar creators')) {
    return JSON.stringify({
      criteria: 'Based on your top performing creators',
      suggestions: [
        { name: 'Sarah Mitchell', handle: '@sarahmitchell', followers: '45.2K', engagement: '6.2%', matchScore: 94, reason: 'Similar audience demographics and content style' },
        { name: 'Alex Rivera', handle: '@alexrivera', followers: '38.5K', engagement: '5.8%', matchScore: 91, reason: 'High engagement in same niche' },
        { name: 'Priya Sharma', handle: '@priyacreates', followers: '52.1K', engagement: '5.1%', matchScore: 88, reason: 'Authentic voice, rising engagement' }
      ],
      searchTips: ['Consider micro-influencers (10K-50K) for better ROI', 'Look for 4%+ engagement rate', 'Prioritize authentic audience over follower count']
    });
  }

  if (prompt.includes('find creators') || prompt.includes('matching creators')) {
    return JSON.stringify({
      campaignFit: 'High',
      recommendations: [
        { name: 'Emma Wilson', handle: '@emmawilson', followers: '67K', engagement: '5.4%', matchScore: 96, niche: 'Fashion & Lifestyle', estimatedRate: '$1,200-1,800' },
        { name: 'Mike Chen', handle: '@mikefoodie', followers: '89K', engagement: '4.9%', matchScore: 92, niche: 'Lifestyle', estimatedRate: '$1,500-2,200' },
        { name: 'Sofia Rodriguez', handle: '@sofiastyle', followers: '43K', engagement: '7.1%', matchScore: 90, niche: 'Fashion', estimatedRate: '$800-1,200' }
      ],
      insights: 'For your campaign budget, we recommend 3-5 micro-influencers over 1 macro influencer for better engagement and ROI.'
    });
  }

  if (prompt.includes('compare') || prompt.includes('comparison')) {
    return JSON.stringify({
      comparison: [
        { metric: 'Followers', creator1: '67K', creator2: '89K', winner: 'Creator 2' },
        { metric: 'Engagement Rate', creator1: '5.4%', creator2: '4.2%', winner: 'Creator 1' },
        { metric: 'Audience Authenticity', creator1: '94%', creator2: '88%', winner: 'Creator 1' },
        { metric: 'Brand Safety Score', creator1: '96', creator2: '92', winner: 'Creator 1' },
        { metric: 'Content Quality', creator1: '91', creator2: '94', winner: 'Creator 2' }
      ],
      recommendation: 'Creator 1 offers better engagement and audience quality, making them ideal for campaigns focused on conversions. Creator 2 has higher reach, better for awareness campaigns.',
      bestFor: { creator1: 'Conversion & Engagement', creator2: 'Reach & Awareness' }
    });
  }

  if (prompt.includes('audience') || prompt.includes('demographics')) {
    return JSON.stringify({
      demographics: {
        ageGroups: [
          { range: '18-24', percentage: 32 },
          { range: '25-34', percentage: 45 },
          { range: '35-44', percentage: 18 },
          { range: '45+', percentage: 5 }
        ],
        gender: { female: 68, male: 30, other: 2 },
        topLocations: ['United States (42%)', 'United Kingdom (18%)', 'Canada (12%)', 'Australia (8%)'],
        interests: ['Fashion', 'Travel', 'Beauty', 'Lifestyle', 'Wellness']
      },
      audienceQuality: {
        realFollowers: 94,
        activeEngagers: 67,
        potentialReach: '45K-52K per post'
      },
      brandAlignment: 'High alignment with young professional demographic. Audience interests match luxury lifestyle and premium fashion brands.'
    });
  }
  
  if (prompt.includes('campaign brief') || prompt.includes('campaign description')) {
    return JSON.stringify({
      title: 'Summer Vibes Campaign 2026',
      objective: 'Increase brand awareness and drive sales for summer collection',
      targetAudience: 'Fashion-forward millennials and Gen-Z, ages 18-35',
      keyMessages: [
        'Sustainable and stylish summer essentials',
        'Comfortable yet trendy pieces for any occasion',
        'Limited edition designs that make a statement'
      ],
      contentGuidelines: [
        'Authentic, lifestyle-focused content',
        'Outdoor/summer settings preferred',
        'Include product styling tips',
        'Use campaign hashtag #SummerVibes2026'
      ],
      deliverables: '2 Instagram posts, 3 Stories, 1 Reel',
      timeline: '4 weeks'
    });
  }
  
  if (prompt.includes('risk') || prompt.includes('safety')) {
    return JSON.stringify({
      overallRisk: 'Low',
      score: 92,
      factors: [
        { name: 'Follower Authenticity', status: 'Good', detail: '94% real followers detected' },
        { name: 'Content Safety', status: 'Good', detail: 'No controversial content in past 6 months' },
        { name: 'Brand Alignment', status: 'Good', detail: 'Values align with family-friendly brands' },
        { name: 'Engagement Quality', status: 'Excellent', detail: 'Comments show genuine community interaction' }
      ],
      recommendation: 'Low risk for brand partnerships. Recommend proceeding with collaboration.'
    });
  }
  
  if (prompt.includes('negotiate') || prompt.includes('rate') || prompt.includes('pricing')) {
    return JSON.stringify({
      suggestedRate: '$2,500 - $3,500',
      marketComparison: 'Slightly below market average for this follower count',
      negotiationTips: [
        'Their engagement rate justifies a premium - consider offering bonus for performance',
        'Bundle multiple deliverables for better per-unit pricing',
        'Offer exclusivity period in exchange for rate discount'
      ],
      dealStructure: {
        base: '$2,800',
        performanceBonus: '+$500 if post exceeds 5% engagement',
        usage: '+$800 for 6-month usage rights'
      }
    });
  }

  return JSON.stringify({ message: 'AI analysis complete', status: 'success' });
}

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'analyze-bio':
        systemPrompt = 'You are an expert influencer marketing analyst. Analyze creator profiles and provide insights in JSON format.';
        userPrompt = `Analyze this creator profile and bio: "${data.bio}". Return JSON with: niche, tone, brandFit (0-100), strengths (array), concerns (array), recommendation.`;
        break;

      case 'outreach-email':
        systemPrompt = 'You are an expert at writing personalized creator outreach emails that get responses. Write professional, warm emails.';
        userPrompt = `Write a collaboration outreach email for: Creator: ${data.creatorName}, Niche: ${data.niche}, Brand: ${data.brandName}, Campaign: ${data.campaignGoal}`;
        break;

      case 'campaign-brief':
        systemPrompt = 'You are a marketing strategist who creates compelling campaign briefs.';
        userPrompt = `Generate a campaign brief for: Goal: ${data.goal}, Target: ${data.target}, Budget: ${data.budget}. Return JSON with: title, objective, targetAudience, keyMessages (array), contentGuidelines (array), deliverables, timeline.`;
        break;

      case 'hashtag-analysis':
        systemPrompt = 'You are a social media expert who analyzes hashtag trends and performance.';
        userPrompt = `Analyze hashtags for this campaign: Niche: ${data.niche}, Platform: ${data.platform}. Return JSON with: trending (array), niche (array), branded (array), engagement (object), recommendation.`;
        break;

      case 'caption-ideas':
        systemPrompt = 'You are a creative social media copywriter who writes viral captions.';
        userPrompt = `Generate caption ideas for: Product: ${data.product}, Tone: ${data.tone}, Platform: ${data.platform}. Return JSON with: captions (3 options), hooks (3 options), cta (3 options).`;
        break;

      case 'risk-assessment':
        systemPrompt = 'You are a brand safety analyst who evaluates creator risk.';
        userPrompt = `Assess risk for creator profile: ${data.creatorData}. Return JSON with: overallRisk, score (0-100), factors (array with name, status, detail), recommendation.`;
        break;

      case 'rate-negotiation':
        systemPrompt = 'You are an influencer marketing pricing expert.';
        userPrompt = `Suggest pricing for: Followers: ${data.followers}, Engagement: ${data.engagement}, Deliverables: ${data.deliverables}. Return JSON with: suggestedRate, marketComparison, negotiationTips (array), dealStructure (object).`;
        break;

      case 'find-similar':
        systemPrompt = 'You are an influencer discovery expert who finds similar creators.';
        userPrompt = `Find similar creators to: Type: ${data.creatorType}, Niche: ${data.niche}, Engagement: ${data.engagement}. Return JSON with: criteria, suggestions (array with name, handle, followers, engagement, matchScore, reason), searchTips (array).`;
        break;

      case 'find-creators':
        systemPrompt = 'You are an influencer matching expert who finds perfect creators for campaigns.';
        userPrompt = `Find creators for campaign: Goal: ${data.goal}, Target: ${data.target}, Budget: ${data.budget}. Return JSON with: campaignFit, recommendations (array with name, handle, followers, engagement, matchScore, niche, estimatedRate), insights.`;
        break;

      case 'compare-creators':
        systemPrompt = 'You are an influencer comparison analyst.';
        userPrompt = `Compare these creators: ${data.creators}. Return JSON with: comparison (array with metric, creator1, creator2, winner), recommendation, bestFor (object).`;
        break;

      case 'audience-analysis':
        systemPrompt = 'You are an audience demographics and insights expert.';
        userPrompt = `Analyze audience for: Platform: ${data.platform}, Niche: ${data.niche}. Return JSON with: demographics (ageGroups array, gender object, topLocations array, interests array), audienceQuality (realFollowers, activeEngagers, potentialReach), brandAlignment.`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid AI request type' }, { status: 400 });
    }

    const response = await callOpenAI([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Try to parse as JSON, otherwise return as text
    try {
      const parsed = JSON.parse(response);
      return NextResponse.json({ success: true, data: parsed });
    } catch {
      return NextResponse.json({ success: true, data: response });
    }

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}

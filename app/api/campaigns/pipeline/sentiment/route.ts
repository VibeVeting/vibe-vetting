import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { CampaignPipelineModel, SentimentAnalysis, SentimentType } from "@/lib/models/campaign-pipeline";

// OpenAI API for sentiment analysis
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Sentiment analysis prompt
const SENTIMENT_ANALYSIS_PROMPT = `You are an expert at analyzing creator responses to brand collaboration emails. 
Analyze the following creator response and provide a detailed sentiment analysis in JSON format.

Response to analyze:
"""
{RESPONSE}
"""

Provide your analysis in the following JSON format:
{
  "overallSentiment": "positive" | "negative" | "neutral" | "interested" | "hesitant",
  "confidenceScore": 0.0 to 1.0,
  "keyPhrases": ["array of key phrases that indicate sentiment"],
  "interestLevel": 1 to 10,
  "priceExpectation": "higher" | "lower" | "acceptable" | "unknown",
  "urgency": "high" | "medium" | "low",
  "concerns": ["array of concerns raised"],
  "positiveIndicators": ["array of positive signals"],
  "suggestedNextStep": "recommended action based on analysis",
  "negotiationAdvice": "advice for price negotiation if applicable"
}

Only respond with valid JSON, no other text.`;

// Helper to verify authentication
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "No token provided" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }) };
  }

  return { userId: payload.userId };
}

// Analyze sentiment using OpenAI
async function analyzeWithOpenAI(response: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    return getMockAnalysis(response);
  }

  try {
    const result = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing creator/influencer responses to brand collaboration opportunities.",
          },
          {
            role: "user",
            content: SENTIMENT_ANALYSIS_PROMPT.replace("{RESPONSE}", response),
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    const data = await result.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return getMockAnalysis(response);
  } catch (error) {
    console.error("OpenAI sentiment analysis error:", error);
    return getMockAnalysis(response);
  }
}

// Mock analysis for development/demo
function getMockAnalysis(response: string): any {
  const lowerResponse = response.toLowerCase();
  
  // Simple keyword-based analysis
  const positiveKeywords = ["interested", "love", "excited", "yes", "definitely", "sounds great", "let's do it", "amazing", "perfect"];
  const negativeKeywords = ["not interested", "no thanks", "pass", "decline", "too busy", "not a fit", "sorry"];
  const hesitantKeywords = ["maybe", "let me think", "need more info", "not sure", "depends", "what's the budget", "how much"];
  const priceKeywords = ["rate", "price", "budget", "fee", "compensation", "pay", "offer", "worth"];
  
  let sentiment: SentimentType = "neutral";
  let interestLevel = 5;
  let priceExpectation: "higher" | "lower" | "acceptable" | "unknown" = "unknown";
  const concerns: string[] = [];
  const positiveIndicators: string[] = [];
  const keyPhrases: string[] = [];
  
  // Check for positive signals
  const positiveMatches = positiveKeywords.filter(k => lowerResponse.includes(k));
  if (positiveMatches.length > 0) {
    sentiment = positiveMatches.length > 2 ? "positive" : "interested";
    interestLevel = Math.min(10, 6 + positiveMatches.length);
    positiveIndicators.push(...positiveMatches.map(k => `Uses "${k}"`));
    keyPhrases.push(...positiveMatches);
  }
  
  // Check for negative signals
  const negativeMatches = negativeKeywords.filter(k => lowerResponse.includes(k));
  if (negativeMatches.length > 0) {
    sentiment = "negative";
    interestLevel = Math.max(1, 4 - negativeMatches.length);
    concerns.push(...negativeMatches.map(k => `Mentioned "${k}"`));
    keyPhrases.push(...negativeMatches);
  }
  
  // Check for hesitation
  const hesitantMatches = hesitantKeywords.filter(k => lowerResponse.includes(k));
  if (hesitantMatches.length > 0 && sentiment !== "negative") {
    sentiment = "hesitant";
    interestLevel = Math.min(interestLevel, 6);
    concerns.push("Shows hesitation");
    keyPhrases.push(...hesitantMatches);
  }
  
  // Check for price discussions
  const priceMatches = priceKeywords.filter(k => lowerResponse.includes(k));
  if (priceMatches.length > 0) {
    if (lowerResponse.includes("higher") || lowerResponse.includes("more") || lowerResponse.includes("usually charge")) {
      priceExpectation = "higher";
      concerns.push("Expects higher compensation");
    } else if (lowerResponse.includes("fair") || lowerResponse.includes("works") || lowerResponse.includes("acceptable")) {
      priceExpectation = "acceptable";
      positiveIndicators.push("Price seems acceptable");
    }
    keyPhrases.push(...priceMatches);
  }
  
  // Determine urgency
  let urgency: "high" | "medium" | "low" = "medium";
  if (lowerResponse.includes("asap") || lowerResponse.includes("soon") || lowerResponse.includes("right away")) {
    urgency = "high";
  } else if (lowerResponse.includes("whenever") || lowerResponse.includes("no rush") || lowerResponse.includes("later")) {
    urgency = "low";
  }
  
  // Generate advice
  let suggestedNextStep = "";
  let negotiationAdvice = "";
  
  switch (sentiment) {
    case "positive":
    case "interested":
      suggestedNextStep = "Proceed to send formal offer/contract";
      negotiationAdvice = "Creator is interested. Consider offering slightly above minimum to secure the deal quickly.";
      break;
    case "negative":
      suggestedNextStep = "Thank them and keep for future campaigns";
      negotiationAdvice = "Not a good fit at this time. Don't push further.";
      break;
    case "hesitant":
      suggestedNextStep = "Address their concerns and provide more details";
      negotiationAdvice = "Provide more value proposition. Consider sweetening the offer or adding perks.";
      break;
    default:
      suggestedNextStep = "Follow up for clarification";
      negotiationAdvice = "Need more information to determine negotiation strategy.";
  }
  
  return {
    overallSentiment: sentiment,
    confidenceScore: 0.7 + Math.random() * 0.2,
    keyPhrases: [...new Set(keyPhrases)].slice(0, 5),
    interestLevel,
    priceExpectation,
    urgency,
    concerns,
    positiveIndicators,
    suggestedNextStep,
    negotiationAdvice,
  };
}

// Generate automated negotiation response
function generateNegotiationResponse(analysis: any, currentOffer: number, maxBudget: number): any {
  const { priceExpectation, interestLevel, concerns } = analysis;
  
  let suggestedOffer = currentOffer;
  let strategy = "";
  let emailTone = "friendly";
  
  if (priceExpectation === "higher") {
    // Creator expects more
    const increasePercent = interestLevel >= 7 ? 0.15 : interestLevel >= 5 ? 0.1 : 0.05;
    suggestedOffer = Math.min(maxBudget, currentOffer * (1 + increasePercent));
    strategy = "Increase offer to meet creator expectations while staying within budget";
    emailTone = "appreciative";
  } else if (priceExpectation === "acceptable") {
    // Price is acceptable, can proceed
    strategy = "Price accepted. Move to contract phase";
    emailTone = "enthusiastic";
  } else if (priceExpectation === "lower") {
    // Rare but possible
    strategy = "Creator may accept current or lower offer";
    emailTone = "professional";
  } else {
    // Unknown, maintain current offer
    strategy = "Maintain current offer while emphasizing value";
    emailTone = "persuasive";
  }
  
  // Address concerns
  const addressConcerns = concerns.map((concern: string) => ({
    concern,
    suggestedResponse: generateConcernResponse(concern),
  }));
  
  return {
    suggestedOffer,
    offerIncrease: suggestedOffer - currentOffer,
    strategy,
    emailTone,
    addressConcerns,
    shouldCounter: priceExpectation === "higher" && suggestedOffer <= maxBudget,
    shouldProceed: priceExpectation === "acceptable" || interestLevel >= 8,
    shouldDecline: interestLevel <= 2,
  };
}

function generateConcernResponse(concern: string): string {
  const responses: Record<string, string> = {
    "Shows hesitation": "I understand you want to make sure this is the right fit. Let me share some additional details about our brand and what makes this partnership special...",
    "Expects higher compensation": "I appreciate you sharing your rates. Given your engagement and content quality, I'd like to discuss how we can make this work within our budget while ensuring fair compensation...",
    "Timeline concerns": "We're flexible on timing and can adjust the deliverable schedule to work with your content calendar...",
    "Brand fit concerns": "I'd love to share more about our brand values and why I believe your audience would genuinely connect with our products...",
  };
  
  return responses[concern] || "Thank you for sharing your thoughts. Let's discuss how we can address this...";
}

// POST: Analyze sentiment and get negotiation recommendations
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request);
    if (auth.error) return auth.error;

    const body = await request.json();
    const { action, creatorId, response, responses, currentOffer, maxBudget } = body;

    switch (action) {
      case "analyze_response": {
        // Analyze a single response
        if (!response) {
          return NextResponse.json({ error: "Response text is required" }, { status: 400 });
        }

        const analysis = await analyzeWithOpenAI(response);
        
        // If creatorId is provided, save the analysis
        if (creatorId) {
          const sentimentData: SentimentAnalysis = {
            overallSentiment: analysis.overallSentiment,
            confidenceScore: analysis.confidenceScore,
            keyPhrases: analysis.keyPhrases,
            interestLevel: analysis.interestLevel,
            priceExpectation: analysis.priceExpectation,
            urgency: analysis.urgency,
            concerns: analysis.concerns,
            positiveIndicators: analysis.positiveIndicators,
            analyzedAt: new Date(),
            rawResponses: [response],
          };
          
          await CampaignPipelineModel.updateSentimentAnalysis(creatorId, sentimentData);
        }

        return NextResponse.json({
          success: true,
          analysis,
        });
      }

      case "analyze_multiple": {
        // Analyze multiple responses (e.g., email thread)
        if (!responses || !Array.isArray(responses)) {
          return NextResponse.json({ error: "Responses array is required" }, { status: 400 });
        }

        const combinedResponse = responses.join("\n\n---\n\n");
        const analysis = await analyzeWithOpenAI(combinedResponse);
        
        if (creatorId) {
          const sentimentData: SentimentAnalysis = {
            overallSentiment: analysis.overallSentiment,
            confidenceScore: analysis.confidenceScore,
            keyPhrases: analysis.keyPhrases,
            interestLevel: analysis.interestLevel,
            priceExpectation: analysis.priceExpectation,
            urgency: analysis.urgency,
            concerns: analysis.concerns,
            positiveIndicators: analysis.positiveIndicators,
            analyzedAt: new Date(),
            rawResponses: responses,
          };
          
          await CampaignPipelineModel.updateSentimentAnalysis(creatorId, sentimentData);
        }

        return NextResponse.json({
          success: true,
          analysis,
        });
      }

      case "get_negotiation_advice": {
        // Get automated negotiation recommendations
        if (!response || currentOffer === undefined || maxBudget === undefined) {
          return NextResponse.json(
            { error: "Response, current offer, and max budget are required" },
            { status: 400 }
          );
        }

        const analysis = await analyzeWithOpenAI(response);
        const negotiation = generateNegotiationResponse(analysis, currentOffer, maxBudget);

        return NextResponse.json({
          success: true,
          analysis,
          negotiation,
        });
      }

      case "generate_counter_email": {
        // Generate an automated counter-offer email
        if (!response || currentOffer === undefined || !body.newOffer) {
          return NextResponse.json(
            { error: "Response, current offer, and new offer are required" },
            { status: 400 }
          );
        }

        const analysis = await analyzeWithOpenAI(response);
        
        // Generate appropriate email based on analysis
        let emailSubject = "Re: Collaboration Terms";
        let emailBody = "";
        
        if (analysis.priceExpectation === "higher") {
          emailBody = `Thank you for sharing your rates. We really value what you bring to the table.

After reviewing internally, we'd like to offer $${body.newOffer.toLocaleString()} for this collaboration.

${analysis.concerns.length > 0 ? `Regarding your concerns:\n${analysis.concerns.map((c: string) => `• ${generateConcernResponse(c)}`).join('\n')}\n` : ''}
We believe this reflects the quality of your content and your audience engagement. 

Would this work for you?

Looking forward to your thoughts!`;
        } else if (analysis.overallSentiment === "interested") {
          emailBody = `Great to hear you're interested!

To confirm, we're offering $${body.newOffer.toLocaleString()} for this collaboration.

Let me know if you're ready to move forward and I'll send over the contract!`;
        } else {
          emailBody = `Thanks for getting back to us!

We'd love to make this work. Our offer is $${body.newOffer.toLocaleString()}.

Is there anything specific you'd like to discuss or clarify before we proceed?`;
        }

        return NextResponse.json({
          success: true,
          email: {
            subject: emailSubject,
            body: emailBody,
            tone: analysis.interestLevel >= 7 ? "enthusiastic" : "professional",
          },
          analysis,
        });
      }

      case "batch_analyze": {
        // Analyze multiple creators at once
        if (!body.creators || !Array.isArray(body.creators)) {
          return NextResponse.json({ error: "Creators array is required" }, { status: 400 });
        }

        const results = [];
        for (const creator of body.creators) {
          if (creator.response) {
            const analysis = await analyzeWithOpenAI(creator.response);
            results.push({
              creatorId: creator.id,
              creatorName: creator.name,
              analysis,
            });

            // Save to database if creatorId exists
            if (creator.id) {
              const sentimentData: SentimentAnalysis = {
                overallSentiment: analysis.overallSentiment,
                confidenceScore: analysis.confidenceScore,
                keyPhrases: analysis.keyPhrases,
                interestLevel: analysis.interestLevel,
                priceExpectation: analysis.priceExpectation,
                urgency: analysis.urgency,
                concerns: analysis.concerns,
                positiveIndicators: analysis.positiveIndicators,
                analyzedAt: new Date(),
                rawResponses: [creator.response],
              };
              
              await CampaignPipelineModel.updateSentimentAnalysis(creator.id, sentimentData);
            }
          }
        }

        return NextResponse.json({
          success: true,
          results,
          summary: {
            total: results.length,
            positive: results.filter(r => r.analysis.overallSentiment === "positive" || r.analysis.overallSentiment === "interested").length,
            negative: results.filter(r => r.analysis.overallSentiment === "negative").length,
            hesitant: results.filter(r => r.analysis.overallSentiment === "hesitant").length,
            neutral: results.filter(r => r.analysis.overallSentiment === "neutral").length,
            avgInterestLevel: results.reduce((sum, r) => sum + r.analysis.interestLevel, 0) / results.length,
          },
        });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 });
  }
}

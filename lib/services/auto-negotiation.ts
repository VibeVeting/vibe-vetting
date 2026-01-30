/**
 * Auto-Negotiation Service
 * AI-powered automatic negotiation with creators
 */

export interface NegotiationSettings {
  enabled: boolean;
  minBudget: number;
  maxBudget: number;
  targetBudget: number; // Ideal budget to aim for
  maxRounds: number; // Maximum negotiation rounds before requiring manual review
  autoAcceptThreshold: number; // Auto-accept if creator asks within this % of target
  incrementPercentage: number; // How much to increase offer each round (e.g., 10%)
  strategy: 'aggressive' | 'balanced' | 'generous';
  considerEngagement: boolean; // Adjust based on engagement rate
  considerFollowers: boolean; // Adjust based on follower count
  autoDeclineAbove: number; // Auto-decline if ask is above this
}

export interface CreatorProfile {
  followers: string;
  engagementRate: number;
  platform: string;
  niche?: string;
  previousRates?: number[];
}

export interface NegotiationContext {
  currentOffer: number;
  creatorAsk?: number;
  roundNumber: number;
  creatorResponse?: string;
  settings: NegotiationSettings;
  creatorProfile: CreatorProfile;
  deliverables: string[];
}

export interface NegotiationDecision {
  action: 'accept' | 'counter' | 'decline' | 'escalate';
  newOffer?: number;
  message: string;
  reasoning: string;
  confidence: number;
}

// Parse follower count string to number
function parseFollowers(followers: string): number {
  const cleaned = followers.toLowerCase().replace(/,/g, '');
  if (cleaned.includes('m')) {
    return parseFloat(cleaned) * 1000000;
  }
  if (cleaned.includes('k')) {
    return parseFloat(cleaned) * 1000;
  }
  return parseInt(cleaned) || 0;
}

// Calculate market rate based on creator profile
export function calculateMarketRate(profile: CreatorProfile, deliverables: string[]): {
  low: number;
  mid: number;
  high: number;
} {
  const followers = parseFollowers(profile.followers);
  const engagementRate = profile.engagementRate || 2;
  
  // Base rates per 1000 followers
  const platformMultipliers: Record<string, number> = {
    instagram: 10,
    youtube: 15,
    twitter: 6,
    linkedin: 12,
    facebook: 8,
    twitch: 12,
  };
  
  const multiplier = platformMultipliers[profile.platform.toLowerCase()] || 10;
  
  // Calculate base rate
  let baseRate = (followers / 1000) * multiplier;
  
  // Engagement rate adjustment (industry average is ~2%)
  const engagementMultiplier = engagementRate > 4 ? 1.5 : engagementRate > 2 ? 1.2 : 1;
  baseRate *= engagementMultiplier;
  
  // Deliverables adjustment
  const deliverableCount = deliverables.length;
  const deliverableMultiplier = 1 + (deliverableCount - 1) * 0.3;
  baseRate *= deliverableMultiplier;
  
  // Cap for very large accounts
  if (followers > 1000000) {
    baseRate = Math.min(baseRate, 50000);
  }
  
  return {
    low: Math.round(baseRate * 0.7),
    mid: Math.round(baseRate),
    high: Math.round(baseRate * 1.4),
  };
}

// Main auto-negotiation decision engine
export function makeNegotiationDecision(context: NegotiationContext): NegotiationDecision {
  const { settings, currentOffer, creatorAsk, roundNumber, creatorProfile, deliverables } = context;
  
  // Calculate market rate for reference
  const marketRate = calculateMarketRate(creatorProfile, deliverables);
  
  // If no creator ask yet, this is initial outreach
  if (!creatorAsk) {
    return {
      action: 'counter',
      newOffer: settings.targetBudget,
      message: generateInitialOfferMessage(settings.targetBudget, deliverables),
      reasoning: 'Initial offer at target budget',
      confidence: 90,
    };
  }
  
  // Check if creator's ask is within auto-accept threshold
  const acceptThresholdAmount = settings.targetBudget * (1 + settings.autoAcceptThreshold / 100);
  if (creatorAsk <= acceptThresholdAmount) {
    return {
      action: 'accept',
      newOffer: creatorAsk,
      message: generateAcceptMessage(creatorAsk),
      reasoning: `Creator ask (₹${creatorAsk.toLocaleString('en-IN')}) is within ${settings.autoAcceptThreshold}% of target (₹${settings.targetBudget.toLocaleString('en-IN')})`,
      confidence: 95,
    };
  }
  
  // Check if creator's ask is above auto-decline threshold
  if (creatorAsk > settings.autoDeclineAbove) {
    return {
      action: 'decline',
      message: generateDeclineMessage(settings.maxBudget),
      reasoning: `Creator ask (₹${creatorAsk.toLocaleString('en-IN')}) exceeds auto-decline threshold (₹${settings.autoDeclineAbove.toLocaleString('en-IN')})`,
      confidence: 90,
    };
  }
  
  // Check if we've exceeded max rounds
  if (roundNumber >= settings.maxRounds) {
    return {
      action: 'escalate',
      message: 'This negotiation requires manual review.',
      reasoning: `Exceeded maximum negotiation rounds (${settings.maxRounds})`,
      confidence: 100,
    };
  }
  
  // Calculate new offer based on strategy
  let newOffer = calculateNewOffer(context, marketRate);
  
  // Ensure offer doesn't exceed max budget
  if (newOffer > settings.maxBudget) {
    if (creatorAsk <= settings.maxBudget) {
      // Accept at max budget if creator would accept
      return {
        action: 'accept',
        newOffer: settings.maxBudget,
        message: generateAcceptMessage(settings.maxBudget),
        reasoning: 'Offering maximum budget as final offer',
        confidence: 80,
      };
    }
    return {
      action: 'escalate',
      message: 'Budget constraints require manual review.',
      reasoning: `Cannot meet creator ask (₹${creatorAsk.toLocaleString('en-IN')}) within max budget (₹${settings.maxBudget.toLocaleString('en-IN')})`,
      confidence: 85,
    };
  }
  
  return {
    action: 'counter',
    newOffer,
    message: generateCounterMessage(newOffer, creatorAsk, roundNumber, settings.strategy),
    reasoning: `Round ${roundNumber + 1}: Offering ₹${newOffer.toLocaleString('en-IN')} (${settings.strategy} strategy)`,
    confidence: 75 + (roundNumber * 5),
  };
}

function calculateNewOffer(context: NegotiationContext, marketRate: { low: number; mid: number; high: number }): number {
  const { settings, currentOffer, creatorAsk, roundNumber } = context;
  
  if (!creatorAsk) return settings.targetBudget;
  
  const gap = creatorAsk - currentOffer;
  let increment: number;
  
  switch (settings.strategy) {
    case 'aggressive':
      // Small increments, stay closer to original offer
      increment = gap * 0.2;
      break;
    case 'generous':
      // Larger increments, move toward creator ask faster
      increment = gap * 0.5;
      break;
    case 'balanced':
    default:
      // Meet in the middle approach
      increment = gap * 0.35;
  }
  
  // Apply round-based increment
  const roundIncrement = currentOffer * (settings.incrementPercentage / 100);
  increment = Math.max(increment, roundIncrement);
  
  // Consider market rate
  const newOffer = currentOffer + increment;
  
  // If offer is significantly below market low, bump it up
  if (newOffer < marketRate.low * 0.8 && settings.considerFollowers) {
    return Math.min(marketRate.low, settings.maxBudget);
  }
  
  return Math.round(newOffer);
}

function generateInitialOfferMessage(amount: number, deliverables: string[]): string {
  const deliverablesList = deliverables.map(d => `• ${d}`).join('\n');
  return `Hi there!

Thank you for your interest in collaborating with us! We've reviewed your profile and think you'd be a great fit for our campaign.

For the following deliverables:
${deliverablesList}

We'd like to offer ₹${amount.toLocaleString('en-IN')} as compensation.

This rate reflects the value we see in your content and engagement with your audience. We're also open to discussing bonus incentives based on performance!

Looking forward to hearing from you!`;
}

function generateAcceptMessage(amount: number): string {
  return `Wonderful! We're happy to move forward at ₹${amount.toLocaleString('en-IN')}.

We'll be sending over the contract shortly with all the details. Please review it carefully and let us know if you have any questions.

We're excited to work with you!`;
}

function generateDeclineMessage(maxBudget: number): string {
  return `Thank you for your interest and for sharing your rates with us.

Unfortunately, this exceeds our budget for this particular campaign. Our maximum budget is ₹${maxBudget.toLocaleString('en-IN')}.

We'd love to keep you in mind for future campaigns that might be a better fit. Would you be open to staying in touch?

Best regards`;
}

function generateCounterMessage(
  newOffer: number,
  creatorAsk: number,
  roundNumber: number,
  strategy: string
): string {
  const templates = {
    round1: {
      aggressive: `Thank you for sharing your rates! We appreciate the transparency.

While we understand the value you bring, our budget for this campaign is structured differently. We can offer ₹${newOffer.toLocaleString('en-IN')}, which we believe is competitive for the scope of work.

This includes potential for bonuses based on performance metrics. Would this work for you?`,
      balanced: `Thank you for your response! We've considered your rate of ₹${creatorAsk.toLocaleString('en-IN')}.

To find a middle ground that works for both of us, we'd like to propose ₹${newOffer.toLocaleString('en-IN')}.

We value quality partnerships and are confident this collaboration will be mutually beneficial. What do you think?`,
      generous: `Thank you for getting back to us!

We want to make this work and value what you bring to the table. How about ₹${newOffer.toLocaleString('en-IN')}?

We're also happy to discuss additional perks like product gifts, exclusive previews, or affiliate opportunities!`,
    },
    round2: {
      aggressive: `We've reviewed our budget again and can stretch to ₹${newOffer.toLocaleString('en-IN')}.

This is getting close to our ceiling for this campaign. We hope we can find common ground!`,
      balanced: `We really want to work with you! After internal discussions, we can offer ₹${newOffer.toLocaleString('en-IN')}.

This represents our best effort to meet you closer to your expectations while staying within our campaign budget.`,
      generous: `We've pushed our budget to ₹${newOffer.toLocaleString('en-IN')} because we believe in this partnership!

Let us know if this works. We're excited about the possibilities!`,
    },
    final: {
      aggressive: `Our final offer is ₹${newOffer.toLocaleString('en-IN')}. This is the maximum we can allocate for this campaign.

We hope this works for you, but we understand if it doesn't. Either way, we'd love to stay connected for future opportunities!`,
      balanced: `After careful consideration, we can offer ₹${newOffer.toLocaleString('en-IN')} as our best and final offer.

We truly believe this partnership would be amazing and hope we can make it work!`,
      generous: `We've done everything we can and our final offer is ₹${newOffer.toLocaleString('en-IN')}.

This reflects our genuine interest in working with you. Let us know!`,
    },
  };
  
  const roundKey = roundNumber === 0 ? 'round1' : roundNumber === 1 ? 'round2' : 'final';
  return templates[roundKey][strategy as keyof typeof templates.round1] || templates.round1.balanced;
}

// Analyze creator response to extract intent and pricing
export function analyzeCreatorResponse(response: string): {
  sentiment: 'positive' | 'negative' | 'neutral';
  mentionedPrice?: number;
  isCounterOffer: boolean;
  isAcceptance: boolean;
  isDecline: boolean;
  keyPoints: string[];
} {
  const lowerResponse = response.toLowerCase();
  
  // Extract mentioned prices (supports INR ₹ format)
  const priceMatches = response.match(/₹[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:rupees?|inr)/gi);
  let mentionedPrice: number | undefined;
  if (priceMatches) {
    const prices = priceMatches.map(p => {
      const num = p.replace(/[₹,a-zA-Z\s]/g, '');
      return parseFloat(num);
    }).filter(p => p > 100); // Filter out small numbers
    mentionedPrice = prices.length > 0 ? Math.max(...prices) : undefined;
  }
  
  // Detect acceptance
  const acceptanceKeywords = ['yes', 'agree', 'accept', 'deal', 'sounds good', 'let\'s do it', 'i\'m in', 'perfect', 'works for me'];
  const isAcceptance = acceptanceKeywords.some(kw => lowerResponse.includes(kw));
  
  // Detect decline
  const declineKeywords = ['no thanks', 'not interested', 'pass', 'too low', 'can\'t do it', 'decline', 'unfortunately'];
  const isDecline = declineKeywords.some(kw => lowerResponse.includes(kw));
  
  // Detect counter offer
  const counterKeywords = ['usually charge', 'my rate', 'i charge', 'asking for', 'would need', 'minimum', 'at least', 'how about', 'counter'];
  const isCounterOffer = counterKeywords.some(kw => lowerResponse.includes(kw)) && !!mentionedPrice;
  
  // Determine sentiment
  const positiveKeywords = ['excited', 'love', 'great', 'interested', 'happy', 'thrilled', 'amazing'];
  const negativeKeywords = ['unfortunately', 'sorry', 'can\'t', 'won\'t', 'too low', 'not enough'];
  
  const positiveCount = positiveKeywords.filter(kw => lowerResponse.includes(kw)).length;
  const negativeCount = negativeKeywords.filter(kw => lowerResponse.includes(kw)).length;
  
  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  if (negativeCount > positiveCount) sentiment = 'negative';
  
  // Extract key points
  const keyPoints: string[] = [];
  if (mentionedPrice) keyPoints.push(`Mentioned price: ₹${mentionedPrice.toLocaleString('en-IN')}`);
  if (isAcceptance) keyPoints.push('Indicates acceptance');
  if (isDecline) keyPoints.push('Indicates decline');
  if (isCounterOffer) keyPoints.push('Contains counter offer');
  if (lowerResponse.includes('exclusive')) keyPoints.push('Mentioned exclusivity');
  if (lowerResponse.includes('timeline') || lowerResponse.includes('deadline')) keyPoints.push('Concerned about timeline');
  
  return {
    sentiment,
    mentionedPrice,
    isCounterOffer,
    isAcceptance,
    isDecline,
    keyPoints,
  };
}

// Default negotiation settings
export const defaultNegotiationSettings: NegotiationSettings = {
  enabled: false,
  minBudget: 500,
  maxBudget: 5000,
  targetBudget: 2000,
  maxRounds: 3,
  autoAcceptThreshold: 15, // Accept if within 15% of target
  incrementPercentage: 15,
  strategy: 'balanced',
  considerEngagement: true,
  considerFollowers: true,
  autoDeclineAbove: 10000,
};

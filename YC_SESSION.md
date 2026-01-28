# AI Coding Session - Building VibeVetting's Auto-Negotiation Engine

This session shows how I built the AI-powered auto-negotiation feature using Copilot.

---

## Session Goal
Build an AI system that automatically negotiates prices with influencers based on their follower count, engagement rate, and market rates.

---

## The Conversation

**Me:** I need to build an auto-negotiation system for influencer deals. It should calculate fair market rates and make counter-offers automatically.

**AI:** I'll help you build this. Let's start with the core types and market rate calculation.

```typescript
// lib/services/auto-negotiation.ts

export interface NegotiationSettings {
  enabled: boolean;
  minBudget: number;
  maxBudget: number;
  targetBudget: number;
  maxRounds: number;
  autoAcceptThreshold: number;
  strategy: 'aggressive' | 'balanced' | 'generous';
}

export interface CreatorProfile {
  followers: string;
  engagementRate: number;
  platform: string;
}
```

**Me:** Good. Now I need the market rate calculator. Different platforms have different rates.

**AI:** Here's a rate calculator with platform multipliers:

```typescript
function parseFollowers(followers: string): number {
  const cleaned = followers.toLowerCase().replace(/,/g, '');
  if (cleaned.includes('m')) return parseFloat(cleaned) * 1000000;
  if (cleaned.includes('k')) return parseFloat(cleaned) * 1000;
  return parseInt(cleaned) || 0;
}

export function calculateMarketRate(profile: CreatorProfile, deliverables: string[]) {
  const followers = parseFollowers(profile.followers);
  
  const platformMultipliers: Record<string, number> = {
    instagram: 10,
    tiktok: 8,
    youtube: 15,
    twitter: 6,
    linkedin: 12,
  };
  
  const multiplier = platformMultipliers[profile.platform.toLowerCase()] || 10;
  let baseRate = (followers / 1000) * multiplier;
  
  // Engagement adjustment
  if (profile.engagementRate > 4) baseRate *= 1.5;
  else if (profile.engagementRate > 2) baseRate *= 1.2;
  
  return {
    low: Math.round(baseRate * 0.7),
    mid: Math.round(baseRate),
    high: Math.round(baseRate * 1.4),
  };
}
```

**Me:** Perfect. Now the decision engine - should it accept, counter, or decline?

**AI:** Here's the negotiation logic:

```typescript
export interface NegotiationDecision {
  action: 'accept' | 'counter' | 'decline' | 'escalate';
  newOffer?: number;
  message: string;
  reasoning: string;
  confidence: number;
}

export function makeNegotiationDecision(context: NegotiationContext): NegotiationDecision {
  const { settings, currentOffer, creatorAsk, roundNumber } = context;
  
  // Auto-accept if within threshold
  if (creatorAsk && creatorAsk <= settings.targetBudget * (1 + settings.autoAcceptThreshold / 100)) {
    return {
      action: 'accept',
      message: `We're happy to proceed at $${creatorAsk}.`,
      reasoning: 'Ask is within acceptable range',
      confidence: 0.95
    };
  }
  
  // Auto-decline if way over budget
  if (creatorAsk && creatorAsk > settings.autoDeclineAbove) {
    return {
      action: 'decline',
      message: 'Unfortunately this exceeds our budget for this campaign.',
      reasoning: 'Ask exceeds maximum threshold',
      confidence: 0.9
    };
  }
  
  // Too many rounds - escalate to human
  if (roundNumber >= settings.maxRounds) {
    return {
      action: 'escalate',
      message: 'Let me connect you with our team to finalize details.',
      reasoning: 'Max negotiation rounds reached',
      confidence: 0.85
    };
  }
  
  // Make counter-offer
  const increment = currentOffer * (settings.incrementPercentage / 100);
  const newOffer = Math.min(currentOffer + increment, settings.maxBudget);
  
  return {
    action: 'counter',
    newOffer,
    message: `We can offer $${newOffer} for this partnership.`,
    reasoning: 'Counter-offer within budget range',
    confidence: 0.8
  };
}
```

**Me:** Now I need the UI modal for this. React component with negotiation history.

**AI:** Here's the modal component:

```tsx
// components/pipeline/AutoNegotiationModal.tsx

export function AutoNegotiationModal({ isOpen, onClose, creator, campaignId }) {
  const [history, setHistory] = useState<NegotiationHistory[]>([]);
  const [suggestedOffer, setSuggestedOffer] = useState<number | null>(null);
  const [status, setStatus] = useState<'negotiating' | 'accepted' | 'declined'>('negotiating');

  const handleSendOffer = async (amount: number) => {
    const response = await fetch('/api/campaigns/pipeline/auto-negotiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_offer',
        campaignId,
        creatorId: creator._id,
        amount
      }),
    });
    
    const data = await response.json();
    setHistory([...history, data.newEntry]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>Negotiate with {creator.name}</h2>
      
      <div className="market-rate">
        Suggested: ${suggestedOffer}
      </div>
      
      <div className="history">
        {history.map((entry, i) => (
          <div key={i} className={entry.from}>
            {entry.message}
            {entry.amount && <span>${entry.amount}</span>}
          </div>
        ))}
      </div>
      
      <button onClick={() => handleSendOffer(suggestedOffer)}>
        Send Offer
      </button>
    </Modal>
  );
}
```

**Me:** Need the API route to handle this.

**AI:** Here's the API:

```typescript
// app/api/campaigns/pipeline/auto-negotiate/route.ts

export async function POST(request: NextRequest) {
  const { action, campaignId, creatorId, amount } = await request.json();
  
  if (action === 'send_offer') {
    const creator = await getCreator(creatorId);
    const marketRate = calculateMarketRate(creator, ['1 post', '2 stories']);
    
    const decision = makeNegotiationDecision({
      currentOffer: amount,
      settings: campaign.negotiationSettings,
      creatorProfile: creator,
      roundNumber: campaign.negotiationRound
    });
    
    await updateCampaignPipeline(campaignId, creatorId, {
      currentOffer: decision.newOffer || amount,
      negotiationRound: campaign.negotiationRound + 1,
      lastAction: decision.action
    });
    
    return NextResponse.json({ success: true, decision });
  }
}
```

---

## What I Built in This Session

1. **Market rate calculator** - Knows fair prices for each platform
2. **Decision engine** - Accepts, counters, or escalates automatically  
3. **React modal** - Shows negotiation history
4. **API endpoint** - Handles the backend logic

---

## Result

The system now:
- Calculates fair rates based on followers + engagement + platform
- Makes smart counter-offers
- Knows when to accept vs escalate to human
- Tracks full negotiation history

Total time: ~1 hours with AI assistance

---

## Files Created

```
lib/services/auto-negotiation.ts    # 386 lines - core logic
components/pipeline/AutoNegotiationModal.tsx  # 1053 lines - full UI
app/api/campaigns/pipeline/auto-negotiate/route.ts  # API handler
```

This feature would have taken 2 days without AI help.

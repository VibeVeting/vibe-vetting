import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { CampaignPipelineModel, PipelineStage } from "@/lib/models/campaign-pipeline";

const DB_NAME = "vibe-vetting";

// Seed sample pipeline data for demo/testing
export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    // Create or get sample campaign
    const campaignsCollection = db.collection("campaigns");
    let campaign = await campaignsCollection.findOne({ name: "Summer Fashion Launch (Demo)" });
    
    if (!campaign) {
      const result = await campaignsCollection.insertOne({
        userId: new ObjectId(),
        name: "Summer Fashion Launch (Demo)",
        description: "Demo campaign for pipeline testing",
        status: "active",
        budget: 50000,
        startDate: new Date(),
        creatorsCount: 0,
        matchedCreators: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      campaign = { _id: result.insertedId };
    }

    const campaignId = campaign._id.toString();

    // Sample creators at different stages
    const sampleCreators = [
      // Outreach stage
      {
        creatorId: "creator-1",
        creatorName: "Sarah Johnson",
        creatorEmail: "sarah@example.com",
        creatorHandle: "@sarahjohnson",
        platform: "Instagram",
        followers: "125K",
        engagementRate: 4.5,
        currentStage: "outreach" as PipelineStage,
      },
      {
        creatorId: "creator-2",
        creatorName: "Mike Chen",
        creatorEmail: "mike@example.com",
        creatorHandle: "@mikechen",
        platform: "TikTok",
        followers: "500K",
        engagementRate: 6.2,
        currentStage: "outreach" as PipelineStage,
      },
      // Awaiting response
      {
        creatorId: "creator-3",
        creatorName: "Emma Wilson",
        creatorEmail: "emma@example.com",
        creatorHandle: "@emmawilson",
        platform: "YouTube",
        followers: "250K",
        engagementRate: 3.8,
        currentStage: "awaiting_response" as PipelineStage,
      },
      // Response received
      {
        creatorId: "creator-4",
        creatorName: "David Kim",
        creatorEmail: "david@example.com",
        creatorHandle: "@davidkim",
        platform: "Instagram",
        followers: "89K",
        engagementRate: 5.1,
        currentStage: "response_received" as PipelineStage,
      },
      // Negotiation
      {
        creatorId: "creator-5",
        creatorName: "Lisa Park",
        creatorEmail: "lisa@example.com",
        creatorHandle: "@lisapark",
        platform: "TikTok",
        followers: "1.2M",
        engagementRate: 7.3,
        currentStage: "negotiation" as PipelineStage,
      },
      // Agreement reached
      {
        creatorId: "creator-6",
        creatorName: "James Wright",
        creatorEmail: "james@example.com",
        creatorHandle: "@jameswright",
        platform: "Twitter",
        followers: "45K",
        engagementRate: 2.9,
        currentStage: "agreement_reached" as PipelineStage,
      },
      // Contract sent
      {
        creatorId: "creator-7",
        creatorName: "Priya Sharma",
        creatorEmail: "priya@example.com",
        creatorHandle: "@priyasharma",
        platform: "Instagram",
        followers: "320K",
        engagementRate: 4.8,
        currentStage: "contract_sent" as PipelineStage,
      },
      // Contract signed
      {
        creatorId: "creator-8",
        creatorName: "Alex Rivera",
        creatorEmail: "alex@example.com",
        creatorHandle: "@alexrivera",
        platform: "YouTube",
        followers: "180K",
        engagementRate: 3.5,
        currentStage: "contract_signed" as PipelineStage,
      },
      // In progress
      {
        creatorId: "creator-9",
        creatorName: "Jessica Brown",
        creatorEmail: "jessica@example.com",
        creatorHandle: "@jessicabrown",
        platform: "Instagram",
        followers: "95K",
        engagementRate: 5.2,
        currentStage: "in_progress" as PipelineStage,
      },
      // Completed with review
      {
        creatorId: "creator-10",
        creatorName: "Chris Taylor",
        creatorEmail: "chris@example.com",
        creatorHandle: "@christaylor",
        platform: "TikTok",
        followers: "650K",
        engagementRate: 8.1,
        currentStage: "completed" as PipelineStage,
      },
      // Declined
      {
        creatorId: "creator-11",
        creatorName: "Amanda Lee",
        creatorEmail: "amanda@example.com",
        creatorHandle: "@amandalee",
        platform: "Instagram",
        followers: "78K",
        engagementRate: 3.2,
        currentStage: "declined" as PipelineStage,
      },
      // No response
      {
        creatorId: "creator-12",
        creatorName: "Ryan Garcia",
        creatorEmail: "ryan@example.com",
        creatorHandle: "@ryangarcia",
        platform: "YouTube",
        followers: "120K",
        engagementRate: 2.8,
        currentStage: "no_response" as PipelineStage,
      },
    ];

    // Clear existing pipeline data for this campaign
    const pipelineCollection = db.collection("campaign_creators");
    await pipelineCollection.deleteMany({ campaignId: new ObjectId(campaignId) });

    // Add creators to pipeline
    const addedCreators = await CampaignPipelineModel.bulkAddCreators(
      campaignId,
      sampleCreators
    );

    // Add detailed data for some creators
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Update creator with sentiment analysis (response received)
    const responseCreator = addedCreators.find(c => c.creatorId === "creator-4");
    if (responseCreator) {
      await CampaignPipelineModel.updateSentimentAnalysis(responseCreator._id!.toString(), {
        overallSentiment: "interested",
        confidenceScore: 0.85,
        keyPhrases: ["sounds interesting", "love to work together", "what's the budget"],
        interestLevel: 7,
        priceExpectation: "unknown",
        urgency: "medium",
        concerns: ["Wants to know more about the budget"],
        positiveIndicators: ["Expressed interest", "Enthusiastic tone"],
        analyzedAt: now,
        rawResponses: ["Hi! This sounds really interesting. I'd love to work with you. What's the budget range you're working with?"],
      });
    }

    // Update creator with negotiation data
    const negotiationCreator = addedCreators.find(c => c.creatorId === "creator-5");
    if (negotiationCreator) {
      await CampaignPipelineModel.startNegotiation(
        negotiationCreator._id!.toString(),
        1500,
        [
          { type: "instagram_post", quantity: 2, description: "Feed posts showcasing product" },
          { type: "instagram_story", quantity: 4, description: "Story swipe-ups" },
          { type: "instagram_reel", quantity: 1, description: "60-second product review" },
        ],
        "USD"
      );
      
      await CampaignPipelineModel.addCounterOffer(negotiationCreator._id!.toString(), {
        from: "creator",
        amount: 2500,
        message: "Given my engagement rates and audience demographics, I typically charge $2,500 for this scope of work.",
        sentAt: dayAgo,
      });

      await CampaignPipelineModel.updateSentimentAnalysis(negotiationCreator._id!.toString(), {
        overallSentiment: "positive",
        confidenceScore: 0.78,
        keyPhrases: ["excited", "great fit", "higher rate"],
        interestLevel: 8,
        priceExpectation: "higher",
        urgency: "medium",
        concerns: ["Expects higher compensation"],
        positiveIndicators: ["Very interested", "Sees brand fit"],
        analyzedAt: now,
        rawResponses: ["I'm really excited about this opportunity! I think we'd be a great fit. My typical rate for this scope is $2,500."],
      });
    }

    // Update creator with agreement data
    const agreedCreator = addedCreators.find(c => c.creatorId === "creator-6");
    if (agreedCreator) {
      await CampaignPipelineModel.startNegotiation(
        agreedCreator._id!.toString(),
        800,
        [
          { type: "twitter_post", quantity: 3, description: "Thread about product" },
        ],
        "USD"
      );
      await CampaignPipelineModel.finalizeNegotiation(
        agreedCreator._id!.toString(),
        900,
        "100% on completion",
        true
      );
    }

    // Update creator with contract data
    const contractCreator = addedCreators.find(c => c.creatorId === "creator-7");
    if (contractCreator) {
      await CampaignPipelineModel.startNegotiation(
        contractCreator._id!.toString(),
        2000,
        [
          { type: "instagram_post", quantity: 3, description: "Feed posts" },
          { type: "instagram_reel", quantity: 2, description: "Reels" },
        ],
        "USD"
      );
      await CampaignPipelineModel.finalizeNegotiation(
        contractCreator._id!.toString(),
        2200,
        "50% upfront, 50% on completion",
        true
      );
      await CampaignPipelineModel.addDocument(contractCreator._id!.toString(), {
        type: "contract",
        name: "Collaboration Agreement",
        fileUrl: "/contracts/sample.pdf",
        status: "sent",
        sentAt: dayAgo,
        expiresAt: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      });
    }

    // Update completed creator with review
    const completedCreator = addedCreators.find(c => c.creatorId === "creator-10");
    if (completedCreator) {
      await CampaignPipelineModel.startNegotiation(
        completedCreator._id!.toString(),
        3000,
        [
          { type: "tiktok_video", quantity: 3, description: "Trending format videos" },
        ],
        "USD"
      );
      await CampaignPipelineModel.finalizeNegotiation(
        completedCreator._id!.toString(),
        3200,
        "50% upfront, 50% on completion",
        true
      );
      await CampaignPipelineModel.addDocument(completedCreator._id!.toString(), {
        type: "contract",
        name: "Collaboration Agreement",
        fileUrl: "/contracts/sample.pdf",
        status: "signed",
        sentAt: weekAgo,
        signedAt: new Date(weekAgo.getTime() + 2 * 24 * 60 * 60 * 1000),
      });
      await CampaignPipelineModel.addReview(completedCreator._id!.toString(), {
        rating: 5,
        communicationScore: 5,
        contentQualityScore: 5,
        timelinessScore: 4,
        professionalismScore: 5,
        overallExperience: "Amazing to work with! Chris delivered exceptional content that exceeded our expectations. The engagement on his videos was fantastic.",
        wouldWorkAgain: true,
        highlights: ["Great communication", "High-quality content", "Exceeded expectations"],
        concerns: ["Minor delay on final video"],
        reviewedAt: now,
        reviewedBy: "admin",
      });
    }

    // Update campaign creator count
    await campaignsCollection.updateOne(
      { _id: new ObjectId(campaignId) },
      { $set: { creatorsCount: sampleCreators.length, matchedCreators: sampleCreators.filter(c => c.currentStage === "completed").length } }
    );

    return NextResponse.json({
      success: true,
      message: "Pipeline seeded successfully",
      campaignId,
      creatorsAdded: sampleCreators.length,
    });
  } catch (error) {
    console.error("Seed pipeline error:", error);
    return NextResponse.json({ error: "Failed to seed pipeline" }, { status: 500 });
  }
}

// GET: Get seeded campaign ID
export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const campaign = await db.collection("campaigns").findOne({ name: "Summer Fashion Launch (Demo)" });
    
    if (campaign) {
      return NextResponse.json({
        success: true,
        campaignId: campaign._id.toString(),
        campaignName: campaign.name,
      });
    }

    return NextResponse.json({
      success: false,
      message: "No seeded campaign found. POST to this endpoint to seed data.",
    });
  } catch (error) {
    console.error("Get seeded campaign error:", error);
    return NextResponse.json({ error: "Failed to get seeded campaign" }, { status: 500 });
  }
}

import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";

// ==================== Types ====================

export type PipelineStage = 
  | "outreach"           // Initial email sent
  | "awaiting_response"  // Waiting for creator reply
  | "response_received"  // Creator responded
  | "negotiation"        // Price negotiation in progress
  | "agreement_reached"  // Price agreed
  | "contract_sent"      // Contract/documents sent
  | "contract_signed"    // Contract signed
  | "in_progress"        // Campaign in progress
  | "completed"          // Campaign completed
  | "declined"           // Creator declined
  | "no_response";       // No response after follow-ups

export type SentimentType = "positive" | "negative" | "neutral" | "interested" | "hesitant";

export type NegotiationStatus = "pending" | "counter_offered" | "accepted" | "rejected";

export type DocumentType = "contract" | "nda" | "brief" | "invoice" | "other";

export type DocumentStatus = "pending" | "sent" | "viewed" | "signed" | "rejected";

// ==================== Interfaces ====================

export interface CampaignCreator {
  _id?: ObjectId;
  campaignId: ObjectId;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  creatorHandle: string;
  platform: string;
  followers: string;
  engagementRate: number;
  currentStage: PipelineStage;
  stageHistory: StageHistoryEntry[];
  
  // Outreach
  outreachEmails: OutreachEmail[];
  lastContactedAt?: Date;
  followUpCount: number;
  
  // Sentiment Analysis
  sentimentAnalysis?: SentimentAnalysis;
  
  // Negotiation
  negotiation?: NegotiationDetails;
  
  // Documents
  documents: CampaignDocument[];
  
  // Final Details
  agreedPrice?: number;
  agreedDeliverables?: string[];
  startDate?: Date;
  endDate?: Date;
  
  // Review & Metrics
  review?: CreatorReview;
  totalCost?: number;
  totalDays?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StageHistoryEntry {
  stage: PipelineStage;
  enteredAt: Date;
  exitedAt?: Date;
  notes?: string;
  durationMinutes?: number;
}

export interface OutreachEmail {
  _id?: ObjectId;
  type: "initial" | "follow_up" | "negotiation" | "confirmation" | "contract" | "review_request";
  subject: string;
  body: string;
  sentAt: Date;
  openedAt?: Date;
  repliedAt?: Date;
  isOpened: boolean;
  isReplied: boolean;
  creatorResponse?: string;
  sentimentScore?: number;
}

export interface SentimentAnalysis {
  overallSentiment: SentimentType;
  confidenceScore: number;
  keyPhrases: string[];
  interestLevel: number; // 1-10
  priceExpectation?: "higher" | "lower" | "acceptable" | "unknown";
  urgency: "high" | "medium" | "low";
  concerns: string[];
  positiveIndicators: string[];
  analyzedAt: Date;
  rawResponses: string[];
}

export interface NegotiationDetails {
  status: NegotiationStatus;
  initialOffer: number;
  creatorAsk?: number;
  counterOffers: CounterOffer[];
  finalPrice?: number;
  currency: string;
  paymentTerms?: string;
  deliverables: DeliverableItem[];
  notes: string[];
  startedAt: Date;
  resolvedAt?: Date;
}

export interface CounterOffer {
  from: "brand" | "creator";
  amount: number;
  message: string;
  sentAt: Date;
  sentimentAnalysis?: {
    sentiment: SentimentType;
    likelihood: number;
  };
}

export interface DeliverableItem {
  type: string;
  quantity: number;
  description: string;
  deadline?: Date;
  completed?: boolean;
}

export interface CampaignDocument {
  _id?: ObjectId;
  type: DocumentType;
  name: string;
  fileUrl?: string;
  status: DocumentStatus;
  sentAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  signedFileUrl?: string;
  expiresAt?: Date;
  notes?: string;
}

export interface CreatorReview {
  rating: number; // 1-5
  communicationScore: number; // 1-5
  contentQualityScore: number; // 1-5
  timelinessScore: number; // 1-5
  professionalismScore: number; // 1-5
  overallExperience: string;
  wouldWorkAgain: boolean;
  highlights: string[];
  concerns: string[];
  reviewedAt: Date;
  reviewedBy: string;
}

export interface CampaignPipelineSummary {
  campaignId: ObjectId;
  totalCreators: number;
  byStage: Record<PipelineStage, number>;
  avgResponseTime: number;
  avgNegotiationTime: number;
  totalBudgetSpent: number;
  successRate: number;
  avgSentimentScore: number;
}

// ==================== Collection Getters ====================

async function getCampaignCreatorsCollection(): Promise<Collection<CampaignCreator>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<CampaignCreator>("campaign_creators");
}

// ==================== Model Functions ====================

export const CampaignPipelineModel = {
  // Add creator to campaign pipeline
  async addCreatorToCampaign(data: Omit<CampaignCreator, "_id" | "createdAt" | "updatedAt">): Promise<CampaignCreator> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const creator: CampaignCreator = {
      ...data,
      stageHistory: [{
        stage: data.currentStage,
        enteredAt: now,
      }],
      followUpCount: 0,
      outreachEmails: [],
      documents: [],
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await collection.insertOne(creator);
    return { ...creator, _id: result.insertedId };
  },

  // Get creator by ID
  async findById(id: string): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Get all creators for a campaign
  async findByCampaign(campaignId: string): Promise<CampaignCreator[]> {
    const collection = await getCampaignCreatorsCollection();
    return collection.find({ campaignId: new ObjectId(campaignId) }).toArray();
  },

  // Get creators by stage
  async findByStage(campaignId: string, stage: PipelineStage): Promise<CampaignCreator[]> {
    const collection = await getCampaignCreatorsCollection();
    return collection.find({ 
      campaignId: new ObjectId(campaignId),
      currentStage: stage 
    }).toArray();
  },

  // Update creator stage
  async updateStage(id: string, newStage: PipelineStage, notes?: string): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const creator = await this.findById(id);
    if (!creator) return null;
    
    // Close previous stage
    const updatedHistory = creator.stageHistory.map((entry, index) => {
      if (index === creator.stageHistory.length - 1 && !entry.exitedAt) {
        const exitedAt = now;
        return {
          ...entry,
          exitedAt,
          durationMinutes: Math.round((exitedAt.getTime() - entry.enteredAt.getTime()) / 60000),
        };
      }
      return entry;
    });
    
    // Add new stage
    updatedHistory.push({
      stage: newStage,
      enteredAt: now,
      notes,
    });
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          currentStage: newStage, 
          stageHistory: updatedHistory,
          updatedAt: now 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Add outreach email
  async addOutreachEmail(id: string, email: Omit<OutreachEmail, "_id">): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $push: { outreachEmails: { ...email, _id: new ObjectId() } },
        $set: { lastContactedAt: now, updatedAt: now },
        $inc: { followUpCount: email.type === "follow_up" ? 1 : 0 }
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Update email with response
  async recordEmailResponse(
    creatorId: string, 
    emailId: string, 
    response: string
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(creatorId),
        "outreachEmails._id": new ObjectId(emailId)
      },
      { 
        $set: { 
          "outreachEmails.$.isReplied": true,
          "outreachEmails.$.repliedAt": now,
          "outreachEmails.$.creatorResponse": response,
          updatedAt: now 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Update sentiment analysis
  async updateSentimentAnalysis(
    id: string, 
    sentiment: SentimentAnalysis
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          sentimentAnalysis: sentiment,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Start negotiation
  async startNegotiation(
    id: string, 
    initialOffer: number, 
    deliverables: DeliverableItem[],
    currency = "USD"
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const negotiation: NegotiationDetails = {
      status: "pending",
      initialOffer,
      counterOffers: [],
      currency,
      deliverables,
      notes: [],
      startedAt: now,
    };
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          negotiation,
          currentStage: "negotiation",
          updatedAt: now 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Add counter offer
  async addCounterOffer(
    id: string, 
    offer: CounterOffer
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $push: { "negotiation.counterOffers": offer },
        $set: { 
          "negotiation.status": "counter_offered",
          "negotiation.creatorAsk": offer.from === "creator" ? offer.amount : undefined,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Finalize negotiation
  async finalizeNegotiation(
    id: string, 
    finalPrice: number, 
    paymentTerms: string,
    accepted: boolean
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          "negotiation.status": accepted ? "accepted" : "rejected",
          "negotiation.finalPrice": finalPrice,
          "negotiation.paymentTerms": paymentTerms,
          "negotiation.resolvedAt": now,
          agreedPrice: accepted ? finalPrice : undefined,
          currentStage: accepted ? "agreement_reached" : "declined",
          updatedAt: now 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Add document
  async addDocument(id: string, document: Omit<CampaignDocument, "_id">): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $push: { documents: { ...document, _id: new ObjectId() } },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Update document status
  async updateDocumentStatus(
    creatorId: string, 
    documentId: string, 
    status: DocumentStatus,
    signedFileUrl?: string
  ): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const updateFields: any = {
      "documents.$.status": status,
      updatedAt: now,
    };
    
    if (status === "viewed") updateFields["documents.$.viewedAt"] = now;
    if (status === "signed") {
      updateFields["documents.$.signedAt"] = now;
      if (signedFileUrl) updateFields["documents.$.signedFileUrl"] = signedFileUrl;
    }
    
    const result = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(creatorId),
        "documents._id": new ObjectId(documentId)
      },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Add review
  async addReview(id: string, review: CreatorReview): Promise<CampaignCreator | null> {
    const collection = await getCampaignCreatorsCollection();
    const creator = await this.findById(id);
    
    if (!creator) return null;
    
    // Calculate total cost and days
    let totalDays = 0;
    if (creator.stageHistory.length > 0) {
      const firstStage = creator.stageHistory[0];
      const lastStage = creator.stageHistory[creator.stageHistory.length - 1];
      const endTime = lastStage.exitedAt || new Date();
      totalDays = Math.ceil((endTime.getTime() - firstStage.enteredAt.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          review,
          totalCost: creator.agreedPrice || 0,
          totalDays,
          currentStage: "completed",
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );
    
    return result;
  },

  // Get pipeline summary for a campaign
  async getPipelineSummary(campaignId: string): Promise<CampaignPipelineSummary> {
    const collection = await getCampaignCreatorsCollection();
    const creators = await this.findByCampaign(campaignId);
    
    const byStage: Record<PipelineStage, number> = {
      outreach: 0,
      awaiting_response: 0,
      response_received: 0,
      negotiation: 0,
      agreement_reached: 0,
      contract_sent: 0,
      contract_signed: 0,
      in_progress: 0,
      completed: 0,
      declined: 0,
      no_response: 0,
    };
    
    let totalResponseTime = 0;
    let responseCount = 0;
    let totalNegotiationTime = 0;
    let negotiationCount = 0;
    let totalBudgetSpent = 0;
    let completedCount = 0;
    let totalSentiment = 0;
    let sentimentCount = 0;
    
    for (const creator of creators) {
      byStage[creator.currentStage]++;
      
      // Calculate response times
      const outreachStage = creator.stageHistory.find(s => s.stage === "outreach");
      const responseStage = creator.stageHistory.find(s => s.stage === "response_received");
      if (outreachStage && responseStage) {
        totalResponseTime += responseStage.enteredAt.getTime() - outreachStage.enteredAt.getTime();
        responseCount++;
      }
      
      // Calculate negotiation times
      if (creator.negotiation?.startedAt && creator.negotiation?.resolvedAt) {
        totalNegotiationTime += creator.negotiation.resolvedAt.getTime() - creator.negotiation.startedAt.getTime();
        negotiationCount++;
      }
      
      // Calculate budget spent
      if (creator.agreedPrice) {
        totalBudgetSpent += creator.agreedPrice;
      }
      
      // Count completed
      if (creator.currentStage === "completed") {
        completedCount++;
      }
      
      // Calculate average sentiment
      if (creator.sentimentAnalysis?.interestLevel) {
        totalSentiment += creator.sentimentAnalysis.interestLevel;
        sentimentCount++;
      }
    }
    
    return {
      campaignId: new ObjectId(campaignId),
      totalCreators: creators.length,
      byStage,
      avgResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
      avgNegotiationTime: negotiationCount > 0 ? totalNegotiationTime / negotiationCount : 0,
      totalBudgetSpent,
      successRate: creators.length > 0 ? (completedCount / creators.length) * 100 : 0,
      avgSentimentScore: sentimentCount > 0 ? totalSentiment / sentimentCount : 0,
    };
  },

  // Bulk add creators to campaign
  async bulkAddCreators(campaignId: string, creators: Array<{
    creatorId: string;
    creatorName: string;
    creatorEmail: string;
    creatorHandle: string;
    platform: string;
    followers: string;
    engagementRate: number;
  }>): Promise<CampaignCreator[]> {
    const collection = await getCampaignCreatorsCollection();
    const now = new Date();
    
    const creatorsToInsert: CampaignCreator[] = creators.map(c => ({
      campaignId: new ObjectId(campaignId),
      ...c,
      currentStage: "outreach" as PipelineStage,
      stageHistory: [{ stage: "outreach" as PipelineStage, enteredAt: now }],
      outreachEmails: [],
      followUpCount: 0,
      documents: [],
      createdAt: now,
      updatedAt: now,
    }));
    
    await collection.insertMany(creatorsToInsert);
    return creatorsToInsert;
  },
};

export default CampaignPipelineModel;

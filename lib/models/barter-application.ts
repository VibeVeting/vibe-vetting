import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "barter_applications";

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'content_pending' | 'submitted' | 'revision_requested' | 'completed' | 'shipped';

export interface BarterApplication {
  _id?: ObjectId;
  offerId: ObjectId;
  creatorId: ObjectId;
  
  // Creator info snapshot (for brand view)
  creatorName: string;
  creatorEmail: string;
  creatorNiche: string;
  creatorFollowerCount: string;
  creatorPrimaryPlatform: string;
  creatorSocialHandles: Record<string, string>;
  
  // Application details
  applicationMessage?: string;
  appliedAt: Date;
  
  // Status tracking
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    changedAt: Date;
    note?: string;
  }[];
  
  // Content submission
  contentLink?: string;
  contentSubmittedAt?: Date;
  
  // Brand feedback
  brandFeedback?: string;
  revisionNotes?: string;
  
  // Shipping
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type CreateApplicationInput = Pick<BarterApplication, 
  'offerId' | 'creatorId' | 'creatorName' | 'creatorEmail' | 'creatorNiche' | 
  'creatorFollowerCount' | 'creatorPrimaryPlatform' | 'creatorSocialHandles' | 'applicationMessage'
>;

async function getCollection(): Promise<Collection<BarterApplication>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterApplication>(COLLECTION_NAME);
}

export const BarterApplicationModel = {
  // Find by ID
  async findById(id: string): Promise<BarterApplication | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Find by creator ID
  async findByCreator(creatorId: string): Promise<BarterApplication[]> {
    const collection = await getCollection();
    return collection.find({ creatorId: new ObjectId(creatorId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Find by offer ID
  async findByOffer(offerId: string): Promise<BarterApplication[]> {
    const collection = await getCollection();
    return collection.find({ offerId: new ObjectId(offerId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Find by offer and creator
  async findByOfferAndCreator(offerId: string, creatorId: string): Promise<BarterApplication | null> {
    const collection = await getCollection();
    return collection.findOne({ 
      offerId: new ObjectId(offerId), 
      creatorId: new ObjectId(creatorId) 
    });
  },

  // Create application
  async create(data: CreateApplicationInput): Promise<BarterApplication> {
    const collection = await getCollection();
    const now = new Date();
    const application: BarterApplication = {
      ...data,
      offerId: new ObjectId(data.offerId),
      creatorId: new ObjectId(data.creatorId),
      appliedAt: now,
      status: 'pending',
      statusHistory: [{
        status: 'pending',
        changedAt: now,
      }],
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(application);
    return { ...application, _id: result.insertedId };
  },

  // Update status
  async updateStatus(id: string, status: ApplicationStatus, note?: string): Promise<BarterApplication | null> {
    const collection = await getCollection();
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { status, updatedAt: now },
        $push: { 
          statusHistory: { 
            status, 
            changedAt: now, 
            note 
          } 
        }
      },
      { returnDocument: "after" }
    );
    return result;
  },

  // Submit content
  async submitContent(id: string, contentLink: string): Promise<BarterApplication | null> {
    const collection = await getCollection();
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          contentLink, 
          contentSubmittedAt: now, 
          status: 'submitted',
          updatedAt: now 
        },
        $push: { 
          statusHistory: { 
            status: 'submitted' as ApplicationStatus, 
            changedAt: now 
          } 
        }
      },
      { returnDocument: "after" }
    );
    return result;
  },

  // Update shipping address
  async updateShippingAddress(id: string, address: BarterApplication['shippingAddress']): Promise<BarterApplication | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { shippingAddress: address, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Mark as shipped
  async markShipped(id: string, trackingNumber: string): Promise<BarterApplication | null> {
    const collection = await getCollection();
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          trackingNumber, 
          shippedAt: now, 
          status: 'shipped',
          updatedAt: now 
        },
        $push: { 
          statusHistory: { 
            status: 'shipped' as ApplicationStatus, 
            changedAt: now 
          } 
        }
      },
      { returnDocument: "after" }
    );
    return result;
  },

  // Get creator stats
  async getCreatorStats(creatorId: string): Promise<{
    totalApplications: number;
    approved: number;
    pending: number;
    completed: number;
    totalProductValue: number;
  }> {
    const collection = await getCollection();
    const applications = await collection.find({ creatorId: new ObjectId(creatorId) }).toArray();
    
    return {
      totalApplications: applications.length,
      approved: applications.filter(a => ['approved', 'content_pending', 'submitted', 'completed', 'shipped'].includes(a.status)).length,
      pending: applications.filter(a => a.status === 'pending').length,
      completed: applications.filter(a => ['completed', 'shipped'].includes(a.status)).length,
      totalProductValue: 0, // This would need to join with offers collection
    };
  },

  // Delete application
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};

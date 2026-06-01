import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "barter_offers";

export type ContentType = 'reel' | 'video' | 'photo' | 'story' | 'carousel';
export type OfferStatus = 'active' | 'paused' | 'completed' | 'expired';

export interface BarterOffer {
  _id?: ObjectId;
  brandId: ObjectId; // Reference to the brand/company user
  brandName: string;
  brandLogo?: string;
  brandEmail?: string;
  
  // Product details
  productName: string;
  productDescription?: string;
  productImage?: string;
  productLink?: string;
  productValue: number; // in INR
  productCategory: string;
  
  // Content requirements
  contentType: ContentType;
  contentRequirement: string;
  script?: string;
  hashtags: string[];
  dos: string[];
  donts: string[];
  
  // Campaign settings
  targetNiches: string[];
  minFollowers?: number;
  maxFollowers?: number;
  targetCities?: string[];
  
  // Slots and deadline
  totalSlots: number;
  filledSlots: number;
  deadline: Date;
  
  // Status
  status: OfferStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBarterOfferInput = Omit<BarterOffer, "_id" | "createdAt" | "updatedAt" | "filledSlots">;

async function getCollection(): Promise<Collection<BarterOffer>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterOffer>(COLLECTION_NAME);
}

export const BarterOfferModel = {
  // Find by ID
  async findById(id: string): Promise<BarterOffer | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Get all active offers
  async findActive(): Promise<BarterOffer[]> {
    const collection = await getCollection();
    return collection.find({ 
      status: 'active',
      deadline: { $gt: new Date() }
    }).sort({ createdAt: -1 }).toArray();
  },

  // Get offers by brand
  async findByBrand(brandId: string): Promise<BarterOffer[]> {
    const collection = await getCollection();
    return collection.find({ brandId: new ObjectId(brandId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Get offers filtered by creator niche and follower count
  async findForCreator(niche: string, followerCount: number): Promise<BarterOffer[]> {
    const collection = await getCollection();
    return collection.find({
      status: 'active',
      deadline: { $gt: new Date() },
      $or: [
        { targetNiches: { $in: [niche, 'All'] } },
        { targetNiches: { $size: 0 } }
      ],
      $and: [
        { $or: [{ minFollowers: { $exists: false } }, { minFollowers: { $lte: followerCount } }] },
        { $or: [{ maxFollowers: { $exists: false } }, { maxFollowers: { $gte: followerCount } }] }
      ]
    }).sort({ createdAt: -1 }).toArray();
  },

  // Create new offer
  async create(data: CreateBarterOfferInput): Promise<BarterOffer> {
    const collection = await getCollection();
    const now = new Date();
    const offer: BarterOffer = {
      ...data,
      filledSlots: 0,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(offer);
    return { ...offer, _id: result.insertedId };
  },

  // Update offer
  async update(id: string, data: Partial<BarterOffer>): Promise<BarterOffer | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Increment filled slots
  async incrementFilledSlots(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id), $expr: { $lt: ["$filledSlots", "$totalSlots"] } },
      { $inc: { filledSlots: 1 }, $set: { updatedAt: new Date() } }
    );
    return result.modifiedCount === 1;
  },

  // Delete offer
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  // Get all offers (for admin)
  async findAll(): Promise<BarterOffer[]> {
    const collection = await getCollection();
    return collection.find({}).sort({ createdAt: -1 }).toArray();
  },
};

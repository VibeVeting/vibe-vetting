import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "barter_companies";

// Barter Company specific types
export interface CompanyProfile {
  companyName: string;
  industry: string;
  website?: string;
  logo?: string;
  description?: string;
  city?: string;
  address?: string;
  gstNumber?: string;
  contactPerson: string;
  contactPhone?: string;
  socialHandles?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
  productsCategories: string[];
  averageProductValue?: number;
  monthlyBarterBudget?: string;
}

export interface BarterCompany {
  _id?: ObjectId;
  email: string;
  password: string;
  userType: 'barter_company';
  companyProfile: CompanyProfile;
  isVerified?: boolean;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBarterCompanyInput = Omit<BarterCompany, "_id" | "createdAt" | "updatedAt">;
export type UpdateBarterCompanyInput = Partial<Omit<BarterCompany, "_id" | "createdAt">>;

async function getCollection(): Promise<Collection<BarterCompany>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterCompany>(COLLECTION_NAME);
}

export const BarterCompanyModel = {
  // Find barter company by ID
  async findById(id: string): Promise<BarterCompany | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Find barter company by email (case-insensitive)
  async findByEmail(email: string): Promise<BarterCompany | null> {
    const collection = await getCollection();
    return collection.findOne({ email: email.toLowerCase() });
  },

  // Get all barter companies
  async findAll(): Promise<BarterCompany[]> {
    const collection = await getCollection();
    return collection.find({}).toArray();
  },

  // Get active barter companies
  async findActive(): Promise<BarterCompany[]> {
    const collection = await getCollection();
    return collection.find({ isActive: true }).toArray();
  },

  // Create a new barter company
  async create(data: CreateBarterCompanyInput): Promise<BarterCompany> {
    const collection = await getCollection();
    const now = new Date();
    const company: BarterCompany = {
      ...data,
      userType: 'barter_company',
      isActive: true,
      twoFactorEnabled: data.twoFactorEnabled ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(company);
    return { ...company, _id: result.insertedId };
  },

  // Update a barter company
  async update(id: string, data: UpdateBarterCompanyInput): Promise<BarterCompany | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Delete a barter company
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  // Find by company name
  async findByCompanyName(companyName: string): Promise<BarterCompany | null> {
    const collection = await getCollection();
    return collection.findOne({ 
      'companyProfile.companyName': { $regex: new RegExp(companyName, 'i') } 
    });
  },

  // Find by industry
  async findByIndustry(industry: string): Promise<BarterCompany[]> {
    const collection = await getCollection();
    return collection.find({ 'companyProfile.industry': industry }).toArray();
  },

  // Search companies
  async search(query: string, limit: number = 10): Promise<BarterCompany[]> {
    const collection = await getCollection();
    return collection.find({
      $or: [
        { 'companyProfile.companyName': { $regex: new RegExp(query, 'i') } },
        { 'companyProfile.industry': { $regex: new RegExp(query, 'i') } },
        { 'companyProfile.city': { $regex: new RegExp(query, 'i') } },
      ]
    }).limit(limit).toArray();
  },

  // Get company statistics
  async getStats(companyId: string): Promise<{
    totalOffers: number;
    activeOffers: number;
    totalApplications: number;
    approvedApplications: number;
    completedCollabs: number;
  }> {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    
    const offersCollection = db.collection('barter_offers');
    const applicationsCollection = db.collection('barter_applications');
    
    const companyObjectId = new ObjectId(companyId);
    
    const [totalOffers, activeOffers] = await Promise.all([
      offersCollection.countDocuments({ brandId: companyObjectId }),
      offersCollection.countDocuments({ brandId: companyObjectId, status: 'active' }),
    ]);

    // Get offer IDs for this company
    const offers = await offersCollection.find({ brandId: companyObjectId }, { projection: { _id: 1 } }).toArray();
    const offerIds = offers.map(o => o._id);

    const [totalApplications, approvedApplications, completedCollabs] = await Promise.all([
      applicationsCollection.countDocuments({ offerId: { $in: offerIds } }),
      applicationsCollection.countDocuments({ offerId: { $in: offerIds }, status: 'approved' }),
      applicationsCollection.countDocuments({ offerId: { $in: offerIds }, status: 'completed' }),
    ]);

    return {
      totalOffers,
      activeOffers,
      totalApplications,
      approvedApplications,
      completedCollabs,
    };
  },
};

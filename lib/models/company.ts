import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "companies";

export interface Company {
  _id?: ObjectId;
  uuid?: string;
  companyName: string;
  location?: string;
  continent?: string;
  region?: string;
  industry?: string;
  industryType?: string;
  description?: string;
  website?: string;
  logo?: string;
  revenue_range?: string;
  employee_range?: string;
  total_funding_amount_usd?: number;
  last_funding_date?: Date | string;
  last_equity_funding_type?: string;
  last_funding_type?: string;
  funding_types?: string[];  // Array of all funding rounds
  founded_year?: number;
  linkedin_url?: string;
  twitter_url?: string;
  // AI-generated insights
  brandInsights?: {
    summary?: string;
    values?: string[];
    targetAudience?: string;
    brandVoice?: string;
    contentThemes?: string[];
    idealCreatorProfile?: string;
    generatedAt?: Date;
  };
  // Blueprint lock status
  blueprintLocked?: boolean;
  blueprintLockedAt?: Date | null;
  blueprintLockedBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

async function getCollection(): Promise<Collection<Company>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<Company>(COLLECTION_NAME);
}

export const CompanyModel = {
  // Find company by ID
  async findById(id: string): Promise<Company | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Find company by name (case-insensitive partial match)
  async findByName(name: string): Promise<Company | null> {
    const collection = await getCollection();
    return collection.findOne({ 
      companyName: { $regex: new RegExp(name, 'i') } 
    });
  },

  // Find company by exact name
  async findByExactName(name: string): Promise<Company | null> {
    const collection = await getCollection();
    return collection.findOne({ 
      companyName: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
  },

  // Search companies
  async search(query: string, limit: number = 10): Promise<Company[]> {
    const collection = await getCollection();
    return collection.find({ 
      companyName: { $regex: new RegExp(query, 'i') } 
    }).limit(limit).toArray();
  },

  // Get all companies
  async findAll(limit: number = 100): Promise<Company[]> {
    const collection = await getCollection();
    return collection.find({}).limit(limit).toArray();
  },

  // Create a new company
  async create(data: Omit<Company, '_id'>): Promise<Company> {
    const collection = await getCollection();
    const now = new Date();
    const company: Company = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(company);
    return { ...company, _id: result.insertedId };
  },

  // Update a company
  async update(id: string, data: Partial<Company>): Promise<Company | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Update brand insights
  async updateBrandInsights(id: string, insights: Company['brandInsights']): Promise<Company | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          brandInsights: { ...insights, generatedAt: new Date() },
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );
    return result;
  },

  // Upsert company by name
  async upsertByName(companyName: string, data: Partial<Company>): Promise<Company> {
    const collection = await getCollection();
    const now = new Date();
    const result = await collection.findOneAndUpdate(
      { companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } },
      { 
        $set: { ...data, updatedAt: now },
        $setOnInsert: { companyName, createdAt: now }
      },
      { upsert: true, returnDocument: "after" }
    );
    return result!;
  },

  // Delete a company
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  // Toggle blueprint lock
  async toggleBlueprintLock(companyName: string, locked: boolean, lockedBy?: string): Promise<Company | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } },
      { 
        $set: { 
          blueprintLocked: locked,
          blueprintLockedAt: locked ? new Date() : null,
          blueprintLockedBy: locked ? lockedBy : null,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: "after" }
    );
    return result;
  },
};

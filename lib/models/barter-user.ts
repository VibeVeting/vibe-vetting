import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "barter_users";

// Barter Creator specific types
export interface CreatorProfile {
  socialHandles: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    twitch?: string;
  };
  primaryPlatform: string;
  followerCount: string;
  niche: string;
  city?: string;
  whyBarter?: string;
  barterReady: boolean;
}

export interface BarterUser {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string;
  userType: 'barter_creator';
  creatorProfile: CreatorProfile;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBarterUserInput = Omit<BarterUser, "_id" | "createdAt" | "updatedAt">;
export type UpdateBarterUserInput = Partial<Omit<BarterUser, "_id" | "createdAt">>;

async function getCollection(): Promise<Collection<BarterUser>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<BarterUser>(COLLECTION_NAME);
}

export const BarterUserModel = {
  // Find barter user by ID
  async findById(id: string): Promise<BarterUser | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Find barter user by email (case-insensitive)
  async findByEmail(email: string): Promise<BarterUser | null> {
    const collection = await getCollection();
    return collection.findOne({ email: email.toLowerCase() });
  },

  // Get all barter users
  async findAll(): Promise<BarterUser[]> {
    const collection = await getCollection();
    return collection.find({}).toArray();
  },

  // Create a new barter user
  async create(data: CreateBarterUserInput): Promise<BarterUser> {
    const collection = await getCollection();
    const now = new Date();
    const user: BarterUser = {
      ...data,
      userType: 'barter_creator',
      twoFactorEnabled: data.twoFactorEnabled ?? false,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  // Update a barter user
  async update(id: string, data: UpdateBarterUserInput): Promise<BarterUser | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Delete a barter user
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },

  // Find by social handle
  async findBySocialHandle(platform: string, handle: string): Promise<BarterUser | null> {
    const collection = await getCollection();
    const query = { [`creatorProfile.socialHandles.${platform}`]: handle };
    return collection.findOne(query);
  },
};

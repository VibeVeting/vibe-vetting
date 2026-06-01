// Email Verification Token Model
// Stores verification tokens for email verification

import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "email_verification_tokens";

export interface EmailVerificationToken {
  _id?: ObjectId;
  email: string;
  token: string;
  userType: 'brand' | 'barter_creator' | 'barter_company';
  userId?: string; // Optional - set after user is created
  expiresAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export type CreateVerificationTokenInput = Omit<
  EmailVerificationToken,
  "_id" | "createdAt" | "verified" | "verifiedAt"
>;

async function getCollection(): Promise<Collection<EmailVerificationToken>> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<EmailVerificationToken>(COLLECTION_NAME);
  
  // Create indexes for efficient lookups
  await collection.createIndex({ token: 1 }, { unique: true });
  await collection.createIndex({ email: 1, userType: 1 });
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
  
  return collection;
}

export const EmailVerificationModel = {
  // Create a new verification token
  async create(data: CreateVerificationTokenInput): Promise<EmailVerificationToken> {
    const collection = await getCollection();
    const now = new Date();
    
    // Delete any existing unverified tokens for this email and userType
    await collection.deleteMany({
      email: data.email.toLowerCase(),
      userType: data.userType,
      verified: false,
    });
    
    const token: EmailVerificationToken = {
      ...data,
      email: data.email.toLowerCase(),
      verified: false,
      createdAt: now,
    };
    
    const result = await collection.insertOne(token);
    return { ...token, _id: result.insertedId };
  },

  // Find token by token string
  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    const collection = await getCollection();
    return collection.findOne({ token });
  },

  // Find latest token by email and userType
  async findByEmail(
    email: string,
    userType: 'brand' | 'barter_creator' | 'barter_company'
  ): Promise<EmailVerificationToken | null> {
    const collection = await getCollection();
    return collection.findOne(
      { email: email.toLowerCase(), userType },
      { sort: { createdAt: -1 } }
    );
  },

  // Mark token as verified
  async markAsVerified(token: string): Promise<boolean> {
    const collection = await getCollection();
    const now = new Date();
    
    const result = await collection.updateOne(
      { token },
      { $set: { verified: true, verifiedAt: now } }
    );
    
    return result.modifiedCount > 0;
  },

  // Check if email is verified
  async isEmailVerified(
    email: string,
    userType: 'brand' | 'barter_creator' | 'barter_company'
  ): Promise<boolean> {
    const collection = await getCollection();
    const token = await collection.findOne({
      email: email.toLowerCase(),
      userType,
      verified: true,
    });
    return token !== null;
  },

  // Validate token (check if valid and not expired)
  async validateToken(tokenString: string): Promise<{
    valid: boolean;
    token?: EmailVerificationToken;
    error?: string;
  }> {
    const collection = await getCollection();
    const token = await collection.findOne({ token: tokenString });
    
    if (!token) {
      return { valid: false, error: 'Invalid verification token' };
    }
    
    if (token.verified) {
      return { valid: false, error: 'Email already verified' };
    }
    
    if (new Date() > token.expiresAt) {
      return { valid: false, error: 'Verification token has expired' };
    }
    
    return { valid: true, token };
  },

  // Delete token
  async delete(token: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ token });
    return result.deletedCount > 0;
  },

  // Delete all tokens for an email
  async deleteByEmail(
    email: string,
    userType: 'brand' | 'barter_creator' | 'barter_company'
  ): Promise<number> {
    const collection = await getCollection();
    const result = await collection.deleteMany({
      email: email.toLowerCase(),
      userType,
    });
    return result.deletedCount;
  },

  // Update userId after user is created
  async updateUserId(token: string, userId: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { token },
      { $set: { userId } }
    );
    return result.modifiedCount > 0;
  },
};

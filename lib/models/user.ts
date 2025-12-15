import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";
import { User, CreateUserInput, UpdateUserInput } from "@/types";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";

async function getCollection(): Promise<Collection<User>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<User>(COLLECTION_NAME);
}

export const UserModel = {
  // Find user by ID
  async findById(id: string): Promise<User | null> {
    const collection = await getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  },

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    const collection = await getCollection();
    return collection.findOne({ email });
  },

  // Get all users
  async findAll(): Promise<User[]> {
    const collection = await getCollection();
    return collection.find({}).toArray();
  },

  // Create a new user
  async create(data: CreateUserInput): Promise<User> {
    const collection = await getCollection();
    const now = new Date();
    const user: User = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  },

  // Update a user
  async update(id: string, data: UpdateUserInput): Promise<User | null> {
    const collection = await getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    return result;
  },

  // Delete a user
  async delete(id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  },
};

import { Collection, ObjectId } from "mongodb";
import clientPromise from "../mongodb";

export interface NotificationDocument {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "notifications";

async function getCollection(): Promise<Collection<NotificationDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<NotificationDocument>(COLLECTION_NAME);
}

export const NotificationModel = {
  async findByUser(userId: string): Promise<NotificationDocument[]> {
    const collection = await getCollection();
    return collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  },

  async create(userId: string, data: { title: string; body: string; type?: string; metadata?: Record<string, unknown> }): Promise<NotificationDocument> {
    const collection = await getCollection();
    const doc: NotificationDocument = {
      userId: new ObjectId(userId),
      title: data.title,
      body: data.body,
      type: data.type,
      metadata: data.metadata,
      read: false,
      createdAt: new Date(),
    };
    const result = await collection.insertOne(doc);
    return { ...doc, _id: result.insertedId };
  },

  async markRead(userId: string, id: string, read: boolean): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id), userId: new ObjectId(userId) },
      read
        ? { $set: { read: true, readAt: new Date() } }
        : { $set: { read: false }, $unset: { readAt: "" } }
    );
    return result.matchedCount === 1;
  },

  async markAllRead(userId: string): Promise<number> {
    const collection = await getCollection();
    const result = await collection.updateMany(
      { userId: new ObjectId(userId), read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    return result.modifiedCount;
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) });
    return result.deletedCount === 1;
  },
};

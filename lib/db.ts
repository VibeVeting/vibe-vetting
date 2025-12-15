import clientPromise from "./mongodb";

const DB_NAME = "vibe-vetting";

// Helper to get database instance
export async function getDb() {
  const client = await clientPromise;
  return client.db(DB_NAME);
}

// Helper to get a collection
export async function getCollection<T extends object>(collectionName: string) {
  const db = await getDb();
  return db.collection<T>(collectionName);
}

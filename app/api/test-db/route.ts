import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vibe-vetting");

    // Ping the database to verify connection
    await db.command({ ping: 1 });

    // Get list of collections
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: "Successfully connected to MongoDB!",
      database: db.databaseName,
      collections: collections.map((col) => col.name),
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to MongoDB",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

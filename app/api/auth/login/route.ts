import { NextRequest, NextResponse } from "next/server";
import { Collection, ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { verifyPassword, generateToken, hashPassword } from "@/lib/auth";
import bcrypt from "bcryptjs";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";
const SESSIONS_COLLECTION = "sessions";
const CODES_COLLECTION = "twofactor_codes";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password: string;
  company?: string;
  twoFactorEnabled?: boolean;
  currentPlan?: string;
  planUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

async function getCollection(): Promise<Collection<UserDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>(COLLECTION_NAME);
}

async function getSessionsCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(SESSIONS_COLLECTION);
}

async function getCodesCollection(): Promise<Collection<any>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection(CODES_COLLECTION);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, code } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const collection = await getCollection();

    // Find user by email
    const user = await collection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If 2FA enabled, enforce code
    if (user.twoFactorEnabled) {
      const codesCol = await getCodesCollection();

      if (!code) {
        // create code and respond challenge
        const oneTimeCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashed = await hashPassword(oneTimeCode);
        await codesCol.insertOne({
          userId: user._id,
          code: hashed,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          createdAt: new Date(),
        });
        return NextResponse.json(
          {
            requires2fa: true,
            message: "Verification code sent to your email.",
            devCode: process.env.NODE_ENV !== 'production' ? oneTimeCode : undefined,
          },
          { status: 200 }
        );
      }

      // validate code
      const activeCode = await codesCol.findOne({ userId: user._id, expiresAt: { $gt: new Date() } }, { sort: { createdAt: -1 } });
      if (!activeCode) {
        return NextResponse.json(
          { error: "Verification code expired. Request a new code." },
          { status: 401 }
        );
      }

      const match = await bcrypt.compare(code, activeCode.code);
      if (!match) {
        return NextResponse.json(
          { error: "Invalid verification code." },
          { status: 401 }
        );
      }

      // remove code after success
      await codesCol.deleteMany({ userId: user._id });
    }

    // Generate JWT token with jti
    const { token, jti } = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Record session - delete any existing sessions from same user agent first
    const sessions = await getSessionsCollection();
    const ua = request.headers.get("user-agent") || "Unknown device";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    
    // Remove old sessions from same device/browser to avoid duplicates
    await sessions.deleteMany({
      userId: user._id,
      userAgent: ua,
    });
    
    await sessions.insertOne({
      userId: user._id,
      jti,
      userAgent: ua,
      ip,
      createdAt: new Date(),
      lastActive: new Date(),
    });

    // Return success response
    return NextResponse.json(
      {
        message: "Login successful",
        token,
        jti,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          company: user.company,
          twoFactorEnabled: user.twoFactorEnabled || false,
          currentPlan: user.currentPlan || "starter",
          planUpdatedAt: user.planUpdatedAt || null,
          userType: 'brand',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

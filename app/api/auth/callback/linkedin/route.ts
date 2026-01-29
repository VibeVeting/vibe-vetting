import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";
import { exchangeLinkedInCode, getLinkedInUserInfo } from "@/lib/oauth";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";
const SESSIONS_COLLECTION = "sessions";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password?: string;
  company?: string;
  image?: string;
  provider?: string;
  providerId?: string;
  linkedinProfile?: string;
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('LinkedIn OAuth error:', error, errorDescription);
      return NextResponse.redirect(new URL('/login?error=oauth_denied', request.url));
    }

    // Validate code
    if (!code) {
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Validate state (CSRF protection)
    const storedState = request.cookies.get('oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
    }

    // Exchange code for tokens
    const tokens = await exchangeLinkedInCode(code);
    
    // Get user info from LinkedIn
    const linkedinUser = await getLinkedInUserInfo(tokens.access_token);

    // Validate that we got email
    if (!linkedinUser.email) {
      console.error('LinkedIn did not return email');
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    // Find or create user in database
    const collection = await getCollection();
    
    let user = await collection.findOne({ email: linkedinUser.email.toLowerCase() });

    if (!user) {
      // Create new user
      const newUser: UserDocument = {
        email: linkedinUser.email.toLowerCase(),
        name: linkedinUser.name || `${linkedinUser.given_name || ''} ${linkedinUser.family_name || ''}`.trim() || 'LinkedIn User',
        image: linkedinUser.picture,
        provider: 'linkedin',
        providerId: linkedinUser.sub,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Update existing user with LinkedIn info if they signed up differently
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            image: linkedinUser.picture || user.image,
            provider: user.provider || 'linkedin',
            providerId: user.providerId || linkedinUser.sub,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Generate JWT token with jti
    const { token, jti } = generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Record session - delete any existing sessions from same user agent first
    const sessions = await getSessionsCollection();
    const ua = request.headers.get("user-agent") || "Unknown device";
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    
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

    // Create response with redirect
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(new URL('/dashboard', baseUrl));

    // Clear OAuth state cookie
    response.cookies.delete('oauth_state');

    // Set auth data in cookies for client-side access
    response.cookies.set('oauth_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('oauth_user', JSON.stringify({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      company: user.company || '',
      twoFactorEnabled: user.twoFactorEnabled || false,
      currentPlan: user.currentPlan || 'starter',
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}

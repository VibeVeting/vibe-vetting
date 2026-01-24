import { NextRequest, NextResponse } from "next/server";
import { Collection } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { generateToken } from "@/lib/auth";
import { exchangeGoogleCode, getGoogleUserInfo } from "@/lib/oauth";

const DB_NAME = "vibe-vetting";
const COLLECTION_NAME = "users";

interface UserDocument {
  _id?: any;
  email: string;
  name: string;
  password?: string;
  company?: string;
  image?: string;
  provider?: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

async function getCollection(): Promise<Collection<UserDocument>> {
  const client = await clientPromise;
  return client.db(DB_NAME).collection<UserDocument>(COLLECTION_NAME);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
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
    const tokens = await exchangeGoogleCode(code);
    
    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // Find or create user in database
    const collection = await getCollection();
    
    let user = await collection.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
      // Create new user
      const newUser: UserDocument = {
        email: googleUser.email.toLowerCase(),
        name: googleUser.name,
        image: googleUser.picture,
        provider: 'google',
        providerId: googleUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    } else {
      // Update existing user with Google info if they signed up differently
      await collection.updateOne(
        { _id: user._id },
        {
          $set: {
            image: googleUser.picture || user.image,
            provider: user.provider || 'google',
            providerId: user.providerId || googleUser.id,
            updatedAt: new Date(),
          },
        }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
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
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    // Return more specific error for debugging
    const errorType = errorMessage.includes('MongoDB') || errorMessage.includes('Mongo') 
      ? 'database_error' 
      : errorMessage.includes('token') || errorMessage.includes('exchange')
        ? 'token_error'
        : 'callback_failed';
    
    return NextResponse.redirect(new URL(`/login?error=${errorType}`, request.url));
  }
}

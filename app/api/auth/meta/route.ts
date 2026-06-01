import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl } from "@/lib/oauth";
import { v4 as uuidv4 } from "uuid";

// Meta OAuth - Redirect to Meta login
export async function GET(request: NextRequest) {
  // Generate state for CSRF protection
  const state = uuidv4();
  
  // Get Meta authorization URL
  const authUrl = getMetaAuthUrl(state);
  
  // Create response with redirect
  const response = NextResponse.redirect(authUrl);
  
  // Store state in cookie for validation
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  
  return response;
}

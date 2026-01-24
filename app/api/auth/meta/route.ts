import { NextRequest, NextResponse } from "next/server";
import { getMetaAuthUrl, generateOAuthState } from "@/lib/oauth";

export async function GET(request: NextRequest) {
  try {
    // Generate state for CSRF protection
    const state = generateOAuthState();
    
    // Store state in a cookie for verification
    const authUrl = getMetaAuthUrl(state);
    
    const response = NextResponse.redirect(authUrl);
    
    // Set state cookie (httpOnly for security)
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Meta OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }
}

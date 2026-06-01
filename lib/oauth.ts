// OAuth Configuration for Google, Meta (Facebook), and LinkedIn

export const oauthConfig = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
      : 'http://localhost:3000/api/auth/callback/google',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile',
  },
  meta: {
    clientId: process.env.META_CLIENT_ID || '',
    clientSecret: process.env.META_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/meta`
      : 'http://localhost:3000/api/auth/callback/meta',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/me',
    scope: 'email,public_profile',
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || '',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
    redirectUri: process.env.NEXTAUTH_URL 
      ? `${process.env.NEXTAUTH_URL}/api/auth/callback/linkedin`
      : 'http://localhost:3000/api/auth/callback/linkedin',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    userInfoUrl: 'https://api.linkedin.com/v2/userinfo',
    scope: 'openid profile email',
  },
};

// Generate OAuth authorization URL for Google
export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: oauthConfig.google.clientId,
    redirect_uri: oauthConfig.google.redirectUri,
    response_type: 'code',
    scope: oauthConfig.google.scope,
    state: state,
    access_type: 'offline',
    prompt: 'consent',
  });
  
  return `${oauthConfig.google.authUrl}?${params.toString()}`;
}

// Generate OAuth authorization URL for Meta
export function getMetaAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: oauthConfig.meta.clientId,
    redirect_uri: oauthConfig.meta.redirectUri,
    response_type: 'code',
    scope: oauthConfig.meta.scope,
    state: state,
  });
  
  return `${oauthConfig.meta.authUrl}?${params.toString()}`;
}

// Generate OAuth authorization URL for LinkedIn
export function getLinkedInAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: oauthConfig.linkedin.clientId,
    redirect_uri: oauthConfig.linkedin.redirectUri,
    response_type: 'code',
    scope: oauthConfig.linkedin.scope,
    state: state,
  });
  
  return `${oauthConfig.linkedin.authUrl}?${params.toString()}`;
}

// Exchange authorization code for tokens - Google
export async function exchangeGoogleCode(code: string): Promise<{
  access_token: string;
  id_token?: string;
  refresh_token?: string;
}> {
  const response = await fetch(oauthConfig.google.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: oauthConfig.google.clientId,
      client_secret: oauthConfig.google.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: oauthConfig.google.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange Google code: ${error}`);
  }

  return response.json();
}

// Exchange authorization code for tokens - Meta
export async function exchangeMetaCode(code: string): Promise<{
  access_token: string;
}> {
  const params = new URLSearchParams({
    client_id: oauthConfig.meta.clientId,
    client_secret: oauthConfig.meta.clientSecret,
    code: code,
    redirect_uri: oauthConfig.meta.redirectUri,
  });

  const response = await fetch(`${oauthConfig.meta.tokenUrl}?${params.toString()}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange Meta code: ${error}`);
  }

  return response.json();
}

// Exchange authorization code for tokens - LinkedIn
export async function exchangeLinkedInCode(code: string): Promise<{
  access_token: string;
  expires_in: number;
  id_token?: string;
}> {
  const response = await fetch(oauthConfig.linkedin.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: oauthConfig.linkedin.clientId,
      client_secret: oauthConfig.linkedin.clientSecret,
      redirect_uri: oauthConfig.linkedin.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange LinkedIn code: ${error}`);
  }

  return response.json();
}

// Get user info from Google
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
}> {
  const response = await fetch(oauthConfig.google.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Google user info');
  }

  return response.json();
}

// Get user info from Meta
export async function getMetaUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: { data: { url: string } };
}> {
  const params = new URLSearchParams({
    fields: 'id,email,name,picture',
    access_token: accessToken,
  });

  const response = await fetch(`${oauthConfig.meta.userInfoUrl}?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to get Meta user info');
  }

  return response.json();
}

// Get user info from LinkedIn (using OpenID Connect userinfo endpoint)
export async function getLinkedInUserInfo(accessToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  email_verified?: boolean;
}> {
  const response = await fetch(oauthConfig.linkedin.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get LinkedIn user info: ${error}`);
  }

  return response.json();
}

// Generate a random state for CSRF protection
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

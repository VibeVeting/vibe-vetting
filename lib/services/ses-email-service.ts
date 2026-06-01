// AWS SES Email Service for Email Verification
// Uses AWS SES SDK to send verification emails

import crypto from 'crypto';

// AWS SES Configuration
const SES_CONFIG = {
  region: process.env.AWS_SES_REGION || 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  fromEmail: process.env.SES_FROM_EMAIL || 'noreply@vibe-vetting.com',
  fromName: process.env.SES_FROM_NAME || 'Vibe Vetting',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export interface SendVerificationEmailOptions {
  email: string;
  name: string;
  verificationToken: string;
  userType: 'brand' | 'barter_creator' | 'barter_company';
}

export interface VerificationEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Generate a secure verification token
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate a 6-digit OTP code
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get verification link based on user type
function getVerificationLink(token: string, userType: string): string {
  const baseUrl = SES_CONFIG.appUrl;
  return `${baseUrl}/verify-email?token=${token}&type=${userType}`;
}

// Get the email template for verification
function getVerificationEmailHTML(options: SendVerificationEmailOptions): string {
  const verificationLink = getVerificationLink(options.verificationToken, options.userType);
  
  let brandColor = '#6366f1'; // Default indigo for brand users
  let welcomeMessage = 'Welcome to Vibe Vetting!';
  let dashboardName = 'Dashboard';
  
  if (options.userType === 'barter_creator') {
    brandColor = '#ec4899'; // Pink for creators
    welcomeMessage = 'Welcome to Barter Creator Platform!';
    dashboardName = 'Creator Dashboard';
  } else if (options.userType === 'barter_company') {
    brandColor = '#8b5cf6'; // Purple for companies
    welcomeMessage = 'Welcome to Barter Company Platform!';
    dashboardName = 'Company Dashboard';
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Vibe Vetting</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a2e;
      background: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .email-card {
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    .header h1 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 16px;
    }
    .message {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .verify-btn {
      display: inline-block;
      background: linear-gradient(135deg, ${brandColor} 0%, ${brandColor}dd 100%);
      color: white !important;
      padding: 16px 40px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .verify-btn:hover {
      opacity: 0.9;
    }
    .link-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .link-section p {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 10px;
    }
    .link-section .link {
      color: ${brandColor};
      word-break: break-all;
      font-size: 12px;
    }
    .expire-notice {
      background: #fef3c7;
      color: #92400e;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      margin-top: 20px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding: 30px;
      text-align: center;
    }
    .footer p {
      color: #94a3b8;
      font-size: 14px;
    }
    .footer .brand {
      color: ${brandColor};
      font-weight: 600;
    }
    .security-notice {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      padding: 16px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .security-notice p {
      color: #166534;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-card">
      <div class="header">
        <div class="logo">V</div>
        <h1>✨ ${welcomeMessage}</h1>
        <p>Just one more step to get started</p>
      </div>
      
      <div class="content">
        <p class="greeting">Hi ${options.name || 'there'}! 👋</p>
        
        <p class="message">
          Thanks for signing up! To complete your registration and access your ${dashboardName}, 
          please verify your email address by clicking the button below.
        </p>
        
        <div style="text-align: center;">
          <a href="${verificationLink}" class="verify-btn">
            ✓ Verify My Email
          </a>
        </div>
        
        <div class="link-section">
          <p>Or copy and paste this link in your browser:</p>
          <p class="link">${verificationLink}</p>
        </div>
        
        <div class="expire-notice">
          ⏱️ This verification link will expire in <strong>24 hours</strong>. 
          Please verify your email before it expires.
        </div>
        
        <div class="security-notice">
          <p>🔒 <strong>Security tip:</strong> If you didn't create an account with Vibe Vetting, 
          you can safely ignore this email.</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Sent with ❤️ from <span class="brand">Vibe Vetting</span></p>
        <p style="margin-top: 10px;">© 2026 Vibe Vetting. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// Get plain text version of email
function getVerificationEmailText(options: SendVerificationEmailOptions): string {
  const verificationLink = getVerificationLink(options.verificationToken, options.userType);
  
  return `
Hi ${options.name || 'there'}!

Thanks for signing up for Vibe Vetting!

To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

This verification link will expire in 24 hours.

If you didn't create an account with Vibe Vetting, you can safely ignore this email.

Best regards,
The Vibe Vetting Team
`;
}

// Send verification email using AWS SES
export async function sendVerificationEmail(
  options: SendVerificationEmailOptions
): Promise<VerificationEmailResult> {
  try {
    // Dynamically import AWS SES SDK
    const { SESClient, SendEmailCommand } = await import('@aws-sdk/client-ses');
    
    // Check if AWS credentials are configured
    if (!SES_CONFIG.accessKeyId || !SES_CONFIG.secretAccessKey) {
      console.warn('AWS SES credentials not configured. Using mock mode.');
      return mockSendEmail(options);
    }

    const sesClient = new SESClient({
      region: SES_CONFIG.region,
      credentials: {
        accessKeyId: SES_CONFIG.accessKeyId,
        secretAccessKey: SES_CONFIG.secretAccessKey,
      },
    });

    const htmlContent = getVerificationEmailHTML(options);
    const textContent = getVerificationEmailText(options);

    const params = {
      Source: `${SES_CONFIG.fromName} <${SES_CONFIG.fromEmail}>`,
      Destination: {
        ToAddresses: [options.email],
      },
      Message: {
        Subject: {
          Charset: 'UTF-8',
          Data: '✨ Verify Your Email - Vibe Vetting',
        },
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent,
          },
          Text: {
            Charset: 'UTF-8',
            Data: textContent,
          },
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    console.log('✅ Verification email sent successfully:', {
      messageId: result.MessageId,
      to: options.email,
      userType: options.userType,
    });

    return {
      success: true,
      messageId: result.MessageId,
    };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    
    // Fallback to mock mode if SES fails (useful for development)
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Development mode: Using mock email service');
      return mockSendEmail(options);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Mock email sender for development/testing
function mockSendEmail(options: SendVerificationEmailOptions): VerificationEmailResult {
  const verificationLink = getVerificationLink(options.verificationToken, options.userType);
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 MOCK EMAIL VERIFICATION (Development Mode)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('To:', options.email);
  console.log('Name:', options.name);
  console.log('User Type:', options.userType);
  console.log('Verification Link:', verificationLink);
  console.log('Token:', options.verificationToken);
  console.log('═══════════════════════════════════════════════════════════════');
  
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
  };
}

// Resend verification email
export async function resendVerificationEmail(
  email: string,
  name: string,
  userType: 'brand' | 'barter_creator' | 'barter_company'
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const newToken = generateVerificationToken();
    
    const result = await sendVerificationEmail({
      email,
      name,
      verificationToken: newToken,
      userType,
    });

    if (result.success) {
      return {
        success: true,
        token: newToken,
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to resend verification email',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

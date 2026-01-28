// Email Service for Campaign Pipeline
// Supports multiple email providers (Nodemailer, SendGrid, etc.)

import { ObjectId } from "mongodb";

// Email configuration
const EMAIL_CONFIG = {
  provider: process.env.EMAIL_PROVIDER || "mock", // "sendgrid", "nodemailer", "mock"
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  fromEmail: process.env.FROM_EMAIL || "campaigns@vibe-vetting.com",
  fromName: process.env.FROM_NAME || "Vibe Vetting",
};

// Email types
export type EmailType = 
  | "initial_outreach"
  | "follow_up_1"
  | "follow_up_2"
  | "follow_up_3"
  | "negotiation_offer"
  | "negotiation_counter"
  | "agreement_confirmation"
  | "contract_send"
  | "contract_reminder"
  | "campaign_brief"
  | "review_request"
  | "thank_you";

export interface EmailTemplate {
  subject: string;
  body: string;
  html: string;
}

export interface SendEmailOptions {
  to: string;
  toName: string;
  type: EmailType;
  variables: Record<string, string>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email Templates
const EMAIL_TEMPLATES: Record<EmailType, (vars: Record<string, string>) => EmailTemplate> = {
  initial_outreach: (vars) => ({
    subject: `Exciting Collaboration Opportunity with ${vars.brandName}`,
    body: `Hi ${vars.creatorName},

I've been following your content and absolutely love your authentic approach to ${vars.niche}. Your engagement with your audience really stands out!

We're ${vars.brandName}, and we're looking for creators who share our passion for ${vars.brandValues}. We believe your audience would love what we offer.

We're planning a campaign for ${vars.campaignName} and think you'd be a perfect fit.

Here's what we're thinking:
${vars.deliverables}

Compensation: ${vars.budgetRange}

Would you be interested in exploring this collaboration? I'd love to set up a quick call to discuss the details.

Looking forward to hearing from you!

Best regards,
${vars.senderName}
${vars.brandName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
    .highlight { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎯 Collaboration Opportunity</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${vars.brandName}</p>
    </div>
    <div class="content">
      <p>Hi <strong>${vars.creatorName}</strong>,</p>
      <p>I've been following your content and absolutely love your authentic approach to <strong>${vars.niche}</strong>. Your engagement with your audience really stands out!</p>
      <p>We're <strong>${vars.brandName}</strong>, and we're looking for creators who share our passion for ${vars.brandValues}.</p>
      
      <div class="highlight">
        <h3 style="margin-top: 0;">📋 Campaign: ${vars.campaignName}</h3>
        <p><strong>Deliverables:</strong></p>
        <p>${vars.deliverables.replace(/\n/g, '<br>')}</p>
        <p><strong>💰 Compensation:</strong> ${vars.budgetRange}</p>
      </div>
      
      <p>Would you be interested in exploring this collaboration?</p>
      <a href="${vars.responseLink || '#'}" class="cta">I'm Interested! →</a>
      
      <p style="margin-top: 30px;">Looking forward to hearing from you!</p>
      <p>Best regards,<br><strong>${vars.senderName}</strong><br>${vars.brandName}</p>
    </div>
    <div class="footer">
      <p>This email was sent by ${vars.brandName} via Vibe Vetting</p>
    </div>
  </div>
</body>
</html>`,
  }),

  follow_up_1: (vars) => ({
    subject: `Quick follow-up: ${vars.campaignName} collaboration`,
    body: `Hi ${vars.creatorName},

I wanted to follow up on my previous email about collaborating on ${vars.campaignName}.

I understand you're busy, but I'd love to chat about this opportunity if you're interested. We think you'd be a great fit for our brand.

Let me know if you have any questions!

Best,
${vars.senderName}
${vars.brandName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>I wanted to follow up on my previous email about collaborating on <strong>${vars.campaignName}</strong>.</p>
  <p>I understand you're busy, but I'd love to chat about this opportunity if you're interested. We think you'd be a great fit for our brand.</p>
  <p>Let me know if you have any questions!</p>
  <p>Best,<br><strong>${vars.senderName}</strong><br>${vars.brandName}</p>
</body>
</html>`,
  }),

  follow_up_2: (vars) => ({
    subject: `Still interested in working together? - ${vars.brandName}`,
    body: `Hi ${vars.creatorName},

Just checking in one more time about the ${vars.campaignName} collaboration opportunity.

If you're interested but the timing isn't right, just let me know and we can keep you in mind for future campaigns.

If this isn't a good fit for you, no worries at all!

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>Just checking in one more time about the <strong>${vars.campaignName}</strong> collaboration opportunity.</p>
  <p>If you're interested but the timing isn't right, just let me know and we can keep you in mind for future campaigns.</p>
  <p>If this isn't a good fit for you, no worries at all!</p>
  <p>Best,<br><strong>${vars.senderName}</strong></p>
</body>
</html>`,
  }),

  follow_up_3: (vars) => ({
    subject: `Final check-in: ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

This is my last follow-up about the ${vars.campaignName} campaign.

If I don't hear back, I'll assume the timing isn't right, but I'd love to work with you on future projects if you're ever interested.

Thanks for your time!

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>This is my last follow-up about the <strong>${vars.campaignName}</strong> campaign.</p>
  <p>If I don't hear back, I'll assume the timing isn't right, but I'd love to work with you on future projects if you're ever interested.</p>
  <p>Thanks for your time!</p>
  <p>Best,<br><strong>${vars.senderName}</strong></p>
</body>
</html>`,
  }),

  negotiation_offer: (vars) => ({
    subject: `Collaboration Terms - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Thank you for your interest in collaborating with ${vars.brandName}!

Based on our conversation, here's what we're proposing:

Campaign: ${vars.campaignName}

Deliverables:
${vars.deliverables}

Compensation: ${vars.offerAmount}
Payment Terms: ${vars.paymentTerms}

Timeline: ${vars.timeline}

Please let me know if this works for you, or if you'd like to discuss any adjustments.

Best regards,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .terms-box { background: #f8f9fa; border: 2px solid #667eea; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .amount { font-size: 28px; color: #667eea; font-weight: bold; }
    .cta { display: inline-block; background: #48bb78; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 5px 10px 0; }
    .cta-secondary { display: inline-block; background: #718096; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 5px 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <p>Hi <strong>${vars.creatorName}</strong>,</p>
    <p>Thank you for your interest in collaborating with <strong>${vars.brandName}</strong>!</p>
    
    <div class="terms-box">
      <h2 style="margin-top: 0; color: #667eea;">📋 Proposed Terms</h2>
      <p><strong>Campaign:</strong> ${vars.campaignName}</p>
      <p><strong>Deliverables:</strong></p>
      <p>${vars.deliverables.replace(/\n/g, '<br>')}</p>
      <p><strong>Compensation:</strong></p>
      <p class="amount">${vars.offerAmount}</p>
      <p><strong>Payment Terms:</strong> ${vars.paymentTerms}</p>
      <p><strong>Timeline:</strong> ${vars.timeline}</p>
    </div>
    
    <p>Please let me know if this works for you, or if you'd like to discuss any adjustments.</p>
    
    <a href="${vars.acceptLink || '#'}" class="cta">✓ Accept Terms</a>
    <a href="${vars.negotiateLink || '#'}" class="cta-secondary">Discuss Terms</a>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>${vars.senderName}</strong></p>
  </div>
</body>
</html>`,
  }),

  negotiation_counter: (vars) => ({
    subject: `Re: Collaboration Terms - Updated Offer`,
    body: `Hi ${vars.creatorName},

Thank you for your feedback on our initial proposal.

After reviewing your request, here's our updated offer:

Previous offer: ${vars.previousAmount}
Updated offer: ${vars.newAmount}

${vars.notes}

We believe this reflects the value you bring to this campaign while working within our budget.

Looking forward to your thoughts!

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>Thank you for your feedback on our initial proposal.</p>
  <p>After reviewing your request, here's our updated offer:</p>
  <div style="background: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0;">
    <p style="margin: 0;"><s>Previous: ${vars.previousAmount}</s></p>
    <p style="margin: 10px 0 0 0; font-size: 24px; color: #48bb78; font-weight: bold;">New: ${vars.newAmount}</p>
  </div>
  <p>${vars.notes}</p>
  <p>We believe this reflects the value you bring to this campaign while working within our budget.</p>
  <p>Looking forward to your thoughts!</p>
  <p>Best,<br><strong>${vars.senderName}</strong></p>
</body>
</html>`,
  }),

  agreement_confirmation: (vars) => ({
    subject: `🎉 Collaboration Confirmed - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Wonderful news! We're thrilled to confirm our collaboration for ${vars.campaignName}.

Here's a summary of what we've agreed:

Compensation: ${vars.finalAmount}
Deliverables:
${vars.deliverables}

Timeline: ${vars.timeline}

Next Steps:
1. We'll send over the contract for your review
2. Once signed, we'll send the campaign brief
3. Get creating!

We're so excited to work with you!

Best,
${vars.senderName}
${vars.brandName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
    .content { padding: 30px; }
    .summary { background: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .steps { background: #ebf8ff; border-radius: 8px; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🎉 It's Official!</h1>
      <p style="margin: 10px 0 0 0;">Collaboration Confirmed</p>
    </div>
    <div class="content">
      <p>Hi <strong>${vars.creatorName}</strong>,</p>
      <p>Wonderful news! We're thrilled to confirm our collaboration for <strong>${vars.campaignName}</strong>.</p>
      
      <div class="summary">
        <h3 style="margin-top: 0;">📋 Agreement Summary</h3>
        <p><strong>Compensation:</strong> <span style="color: #48bb78; font-weight: bold;">${vars.finalAmount}</span></p>
        <p><strong>Deliverables:</strong></p>
        <p>${vars.deliverables.replace(/\n/g, '<br>')}</p>
        <p><strong>Timeline:</strong> ${vars.timeline}</p>
      </div>
      
      <div class="steps">
        <h3 style="margin-top: 0;">🚀 Next Steps</h3>
        <ol>
          <li>We'll send over the contract for your review</li>
          <li>Once signed, we'll send the campaign brief</li>
          <li>Get creating!</li>
        </ol>
      </div>
      
      <p>We're so excited to work with you!</p>
      <p>Best,<br><strong>${vars.senderName}</strong><br>${vars.brandName}</p>
    </div>
  </div>
</body>
</html>`,
  }),

  contract_send: (vars) => ({
    subject: `Contract for Review - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Please find attached the contract for our collaboration on ${vars.campaignName}.

Key Terms:
- Compensation: ${vars.finalAmount}
- Payment Terms: ${vars.paymentTerms}
- Deliverables: ${vars.deliverables}
- Timeline: ${vars.timeline}

Please review and sign the contract at your earliest convenience. If you have any questions, don't hesitate to reach out.

The contract is valid until ${vars.expiryDate}.

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>Please find attached the contract for our collaboration on <strong>${vars.campaignName}</strong>.</p>
  
  <div style="background: #f7fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="margin-top: 0;">📄 Key Terms</h3>
    <ul>
      <li><strong>Compensation:</strong> ${vars.finalAmount}</li>
      <li><strong>Payment Terms:</strong> ${vars.paymentTerms}</li>
      <li><strong>Deliverables:</strong> ${vars.deliverables}</li>
      <li><strong>Timeline:</strong> ${vars.timeline}</li>
    </ul>
  </div>
  
  <p>Please review and sign the contract at your earliest convenience. If you have any questions, don't hesitate to reach out.</p>
  
  <a href="${vars.signLink || '#'}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 10px 0;">📝 Review & Sign Contract</a>
  
  <p style="color: #e53e3e;">⏰ Contract valid until: ${vars.expiryDate}</p>
  
  <p>Best,<br><strong>${vars.senderName}</strong></p>
</body>
</html>`,
  }),

  contract_reminder: (vars) => ({
    subject: `Reminder: Contract Awaiting Signature - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Just a friendly reminder that the contract for ${vars.campaignName} is still awaiting your signature.

The contract expires on ${vars.expiryDate}. Please sign it at your earliest convenience to proceed with the campaign.

If you have any questions or concerns about the terms, please let me know.

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>Just a friendly reminder that the contract for <strong>${vars.campaignName}</strong> is still awaiting your signature.</p>
  <p style="color: #e53e3e;">⏰ The contract expires on <strong>${vars.expiryDate}</strong></p>
  <a href="${vars.signLink || '#'}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 20px 0;">📝 Sign Contract Now</a>
  <p>If you have any questions or concerns about the terms, please let me know.</p>
  <p>Best,<br><strong>${vars.senderName}</strong></p>
</body>
</html>`,
  }),

  campaign_brief: (vars) => ({
    subject: `Campaign Brief - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Now that everything is in place, here's your campaign brief for ${vars.campaignName}!

Campaign Overview:
${vars.campaignDescription}

Deliverables:
${vars.deliverables}

Key Messages:
${vars.keyMessages}

Do's:
${vars.dos}

Don'ts:
${vars.donts}

Hashtags & Tags:
${vars.hashtags}

Timeline:
${vars.timeline}

Please review and let me know if you have any questions. We can't wait to see your content!

Best,
${vars.senderName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; }
    .section { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .do { background: #f0fff4; border-left: 4px solid #48bb78; }
    .dont { background: #fff5f5; border-left: 4px solid #fc8181; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📋 Campaign Brief</h1>
      <p style="margin: 10px 0 0 0;">${vars.campaignName}</p>
    </div>
    <div class="content">
      <p>Hi <strong>${vars.creatorName}</strong>,</p>
      <p>Now that everything is in place, here's your campaign brief!</p>
      
      <div class="section">
        <h3 style="margin-top: 0;">📌 Campaign Overview</h3>
        <p>${vars.campaignDescription}</p>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0;">✅ Deliverables</h3>
        <p>${vars.deliverables.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0;">💬 Key Messages</h3>
        <p>${vars.keyMessages.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="section do">
        <h3 style="margin-top: 0;">✓ Do's</h3>
        <p>${vars.dos.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="section dont">
        <h3 style="margin-top: 0;">✗ Don'ts</h3>
        <p>${vars.donts.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0;">#️⃣ Hashtags & Tags</h3>
        <p>${vars.hashtags}</p>
      </div>
      
      <div class="section">
        <h3 style="margin-top: 0;">📅 Timeline</h3>
        <p>${vars.timeline}</p>
      </div>
      
      <p>Please review and let me know if you have any questions. We can't wait to see your content!</p>
      <p>Best,<br><strong>${vars.senderName}</strong></p>
    </div>
  </div>
</body>
</html>`,
  }),

  review_request: (vars) => ({
    subject: `How was your experience? - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

Thank you so much for being part of ${vars.campaignName}! We loved working with you.

We'd really appreciate if you could take a moment to share your experience working with us. Your feedback helps us improve and create better partnerships.

Click here to leave a quick review: ${vars.reviewLink}

Thanks again for the amazing collaboration!

Best,
${vars.senderName}
${vars.brandName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 30px 0;">
    <h1>⭐ How was your experience?</h1>
  </div>
  <p>Hi <strong>${vars.creatorName}</strong>,</p>
  <p>Thank you so much for being part of <strong>${vars.campaignName}</strong>! We loved working with you.</p>
  <p>We'd really appreciate if you could take a moment to share your experience working with us.</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${vars.reviewLink || '#'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-size: 16px;">📝 Leave a Review</a>
  </div>
  <p>Thanks again for the amazing collaboration!</p>
  <p>Best,<br><strong>${vars.senderName}</strong><br>${vars.brandName}</p>
</body>
</html>`,
  }),

  thank_you: (vars) => ({
    subject: `Thank You! - ${vars.campaignName}`,
    body: `Hi ${vars.creatorName},

We just wanted to say a huge THANK YOU for your incredible work on ${vars.campaignName}!

Your content was amazing and really resonated with our audience. We've seen some great results:
${vars.results}

We'd love to work with you again on future campaigns. We'll definitely be in touch!

Thanks again for everything.

Best,
${vars.senderName}
${vars.brandName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f6e05e 0%, #ed8936 100%); padding: 40px; border-radius: 12px; text-align: center; }
    .content { padding: 30px; }
    .results { background: #f7fafc; border-radius: 12px; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 48px;">🙏</h1>
      <h2 style="margin: 10px 0 0 0;">Thank You!</h2>
    </div>
    <div class="content">
      <p>Hi <strong>${vars.creatorName}</strong>,</p>
      <p>We just wanted to say a huge <strong>THANK YOU</strong> for your incredible work on <strong>${vars.campaignName}</strong>!</p>
      <p>Your content was amazing and really resonated with our audience.</p>
      
      <div class="results">
        <h3 style="margin-top: 0;">📊 Campaign Results</h3>
        <p>${vars.results.replace(/\n/g, '<br>')}</p>
      </div>
      
      <p>We'd love to work with you again on future campaigns. We'll definitely be in touch!</p>
      <p>Thanks again for everything.</p>
      <p>Best,<br><strong>${vars.senderName}</strong><br>${vars.brandName}</p>
    </div>
  </div>
</body>
</html>`,
  }),
};

// Mock email sender for development
async function sendMockEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  console.log(`[MOCK EMAIL] Sending ${options.type} email to ${options.to}`);
  console.log(`[MOCK EMAIL] Subject: ${EMAIL_TEMPLATES[options.type](options.variables).subject}`);
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// SendGrid email sender
async function sendSendGridEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  if (!EMAIL_CONFIG.sendgridApiKey) {
    return { success: false, error: "SendGrid API key not configured" };
  }

  const template = EMAIL_TEMPLATES[options.type](options.variables);

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMAIL_CONFIG.sendgridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: options.to, name: options.toName }],
          },
        ],
        from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
        subject: template.subject,
        content: [
          { type: "text/plain", value: template.body },
          { type: "text/html", value: template.html },
        ],
      }),
    });

    if (response.ok) {
      const messageId = response.headers.get("X-Message-Id") || `sg-${Date.now()}`;
      return { success: true, messageId };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Main email sending function
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  switch (EMAIL_CONFIG.provider) {
    case "sendgrid":
      return sendSendGridEmail(options);
    case "mock":
    default:
      return sendMockEmail(options);
  }
}

// Bulk email sending
export async function sendBulkEmails(
  emails: SendEmailOptions[]
): Promise<{ results: SendEmailResult[]; successCount: number; failCount: number }> {
  const results: SendEmailResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    results.push(result);
    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }
    // Add small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { results, successCount, failCount };
}

// Generate email template for preview
export function generateEmailPreview(
  type: EmailType,
  variables: Record<string, string>
): EmailTemplate {
  return EMAIL_TEMPLATES[type](variables);
}

// Get all available email types
export function getEmailTypes(): EmailType[] {
  return Object.keys(EMAIL_TEMPLATES) as EmailType[];
}

export default {
  sendEmail,
  sendBulkEmails,
  generateEmailPreview,
  getEmailTypes,
};

import { NextRequest, NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterUserModel } from "@/lib/models/barter-user";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import bcrypt from "bcryptjs";

// POST - Add mock data for a specific user email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const results = {
      user: null as string | null,
      applications: 0,
      errors: [] as string[],
    };

    // Check if user exists in barter system
    let user = await BarterUserModel.findByEmail(email);

    // If not, create a new barter creator account
    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      user = await BarterUserModel.create({
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Creator',
        password: hashedPassword,
        userType: 'barter_creator',
        creatorProfile: {
          socialHandles: {
            instagram: '@' + email.split('@')[0],
            youtube: email.split('@')[0] + 'Channel',
          },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Lifestyle',
          city: 'Mumbai',
          whyBarter: 'Excited to collaborate with brands!',
          barterReady: true,
        },
      });
      results.user = 'created';
    } else {
      results.user = 'existing';
    }

    if (!user._id) {
      return NextResponse.json({ error: "Failed to get user ID" }, { status: 500 });
    }

    const creatorId = user._id;
    const creatorProfile = user.creatorProfile;

    // Get all active offers
    const allOffers = await BarterOfferModel.findActive();

    // Sample data for applications
    const applicationMessages = [
      "Hi! I'm so excited about this collaboration opportunity! Your product aligns perfectly with my content and my audience would absolutely love it. I have several creative ideas that would showcase your brand authentically!",
      "I've been a fan of your brand for a while now and would love to create content for you. My engagement rates are consistently high and my followers trust my recommendations.",
      "This product is exactly what my audience has been asking about! I can create both long-form and short-form content that highlights the key features and benefits.",
      "As a content creator focused on quality over quantity, I believe my authentic approach would be perfect for your brand. Looking forward to this opportunity!",
      "I have experience working with similar brands and have always delivered high-quality content on time. My audience demographics match your target market perfectly!",
      "Your product caught my attention immediately! I have a unique content style that would make your product stand out. Let's create something amazing together!",
    ];

    const contentLinks = [
      "https://www.instagram.com/reel/CxYz123AbC/",
      "https://www.youtube.com/watch?v=AbCdEfGhIjK",
      "https://www.instagram.com/p/MnOpQrStUvW/",
      "https://www.youtube.com/shorts/XyZ789LmNoP",
      "https://www.instagram.com/reel/QrStUvWxYz/",
    ];

    const brandFeedback = [
      "Excellent work! The content perfectly captured our product essence. We're thrilled with the results!",
      "Great job! Your audience engagement on this post exceeded our expectations. Would love to collaborate again!",
      "Amazing content quality! The authenticity really came through. Approved for shipping.",
      "Perfect execution of the brief! Thank you for being so creative and professional.",
      "Loved how you showcased the product features. The lighting and editing were spot-on!",
    ];

    const revisionNotes = [
      "Great start! Could you please add more close-up shots of the product packaging and include all required hashtags?",
      "The concept is good but we need the required call-to-action at the end. Also, please ensure the product is visible throughout.",
    ];

    const shippingAddresses = [
      { fullName: user.name, phone: '+91 9876543210', addressLine1: '42, Marine Drive', addressLine2: 'Near Gateway of India', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      { fullName: user.name, phone: '+91 9876543211', addressLine1: '15, MG Road', addressLine2: 'Opposite Central Mall', city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      { fullName: user.name, phone: '+91 9876543212', addressLine1: '88, Connaught Place', addressLine2: 'Block B, First Floor', city: 'Delhi', state: 'Delhi', pincode: '110001' },
    ];

    // Create applications with different statuses
    // 1. Some pending applications (5)
    // 2. Some approved/content pending (4)
    // 3. Some submitted (3)
    // 4. Some revision requested (2)
    // 5. Some completed (5)
    // 6. Some shipped (4)
    // 7. Some rejected (2)

    const statusDistribution = [
      { status: 'pending' as const, count: 5 },
      { status: 'approved' as const, count: 2 },
      { status: 'content_pending' as const, count: 2 },
      { status: 'submitted' as const, count: 3 },
      { status: 'revision_requested' as const, count: 2 },
      { status: 'completed' as const, count: 5 },
      { status: 'shipped' as const, count: 4 },
      { status: 'rejected' as const, count: 2 },
    ];

    let offerIndex = 0;

    for (const dist of statusDistribution) {
      for (let i = 0; i < dist.count && offerIndex < allOffers.length; i++) {
        const offer = allOffers[offerIndex];
        if (!offer._id) {
          offerIndex++;
          continue;
        }

        // Check if application already exists
        const existing = await BarterApplicationModel.findByOfferAndCreator(
          offer._id.toString(),
          creatorId.toString()
        );
        if (existing) {
          offerIndex++;
          continue;
        }

        try {
          // Create base application
          const applicationData = {
            offerId: offer._id,
            creatorId: creatorId,
            creatorName: user.name,
            creatorEmail: user.email,
            creatorNiche: creatorProfile?.niche || 'Lifestyle',
            creatorFollowerCount: creatorProfile?.followerCount || '100K-500K',
            creatorPrimaryPlatform: creatorProfile?.primaryPlatform || 'Instagram',
            creatorSocialHandles: creatorProfile?.socialHandles || {},
            applicationMessage: applicationMessages[Math.floor(Math.random() * applicationMessages.length)],
          };

          const application = await BarterApplicationModel.create(applicationData);
          if (!application._id) {
            offerIndex++;
            continue;
          }

          const appId = application._id.toString();

          // Progress through statuses based on target status
          if (dist.status === 'pending') {
            // Already pending
          } else if (dist.status === 'rejected') {
            await BarterApplicationModel.updateStatus(appId, 'rejected', 'Thank you for your interest, but we have decided to move forward with other creators for this campaign.');
          } else if (dist.status === 'approved') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Congratulations! Your application has been approved. We will ship the product soon!');
          } else if (dist.status === 'content_pending') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Application approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Product has been shipped! Please create and submit your content within 7 days of receiving it.');
          } else if (dist.status === 'submitted') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Application approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Please create your content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
          } else if (dist.status === 'revision_requested') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Create content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
            await BarterApplicationModel.updateStatus(appId, 'revision_requested', revisionNotes[Math.floor(Math.random() * revisionNotes.length)]);
          } else if (dist.status === 'completed') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Create content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
            await BarterApplicationModel.updateStatus(appId, 'completed', brandFeedback[Math.floor(Math.random() * brandFeedback.length)]);
          } else if (dist.status === 'shipped') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Create content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
            await BarterApplicationModel.updateStatus(appId, 'completed', brandFeedback[Math.floor(Math.random() * brandFeedback.length)]);
            const address = shippingAddresses[Math.floor(Math.random() * shippingAddresses.length)];
            await BarterApplicationModel.updateShippingAddress(appId, address);
            await BarterApplicationModel.markShipped(appId, `BARTER${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
          }

          results.applications++;
          offerIndex++;
        } catch (err) {
          results.errors.push(`Application to ${offer.productName}: ${err}`);
          offerIndex++;
        }
      }
    }

    // Get final stats
    const allApplications = await BarterApplicationModel.findByCreator(creatorId.toString());
    const stats = {
      pending: allApplications.filter(a => a.status === 'pending').length,
      approved: allApplications.filter(a => a.status === 'approved').length,
      contentPending: allApplications.filter(a => a.status === 'content_pending').length,
      submitted: allApplications.filter(a => a.status === 'submitted').length,
      revisionRequested: allApplications.filter(a => a.status === 'revision_requested').length,
      completed: allApplications.filter(a => a.status === 'completed').length,
      shipped: allApplications.filter(a => a.status === 'shipped').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      total: allApplications.length,
    };

    return NextResponse.json({
      success: true,
      message: `Successfully added mock data for ${email}`,
      user: {
        status: results.user,
        id: creatorId.toString(),
        name: user.name,
        email: user.email,
        profile: user.creatorProfile,
      },
      applicationsCreated: results.applications,
      totalApplications: stats,
      errors: results.errors,
    }, { status: 201 });

  } catch (error) {
    console.error("Error seeding user data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const CREATOR_EMAIL = "vinay91098@gmail.com";
const CREATOR_PASSWORD = "vinay91098@gmail.com";

async function setupBarterCreator() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    const barterUsersCol = db.collection('barter_users');
    
    const hashedPassword = await bcrypt.hash(CREATOR_PASSWORD, 10);
    
    // Check if barter creator exists
    let creator = await barterUsersCol.findOne({ email: CREATOR_EMAIL });
    
    const creatorData = {
      email: CREATOR_EMAIL,
      name: "Vinay Prajapati",
      password: hashedPassword,
      userType: "barter_creator",
      creatorProfile: {
        socialHandles: {
          instagram: "@vinaycreates",
          youtube: "VinayCreatorHub",
          twitter: "@vinay_content",
          linkedin: "in/vinayprajapati"
        },
        primaryPlatform: "Instagram",
        followerCount: "100K-500K",
        niche: "Tech",
        city: "Bangalore",
        whyBarter: "Love creating authentic content for great brands!",
        barterReady: true,
      },
      isVerified: true,
      twoFactorEnabled: false,
      updatedAt: new Date(),
    };
    
    let creatorId;
    
    if (creator) {
      await barterUsersCol.updateOne(
        { email: CREATOR_EMAIL },
        { $set: creatorData }
      );
      creatorId = creator._id;
      console.log('✓ Updated existing barter creator');
    } else {
      creatorData.createdAt = new Date();
      const result = await barterUsersCol.insertOne(creatorData);
      creatorId = result.insertedId;
      console.log('✓ Created new barter creator');
    }
    
    console.log('Creator ID:', creatorId.toString());
    
    // ===== SEED CREATOR APPLICATIONS =====
    const applicationsCol = db.collection('barter_applications');
    const offersCol = db.collection('barter_offers');
    
    // Get all offers
    const offers = await offersCol.find({}).toArray();
    
    if (offers.length > 0) {
      // Delete existing applications for this creator
      await applicationsCol.deleteMany({ creatorId: creatorId });
      
      const applications = [];
      const statuses = ['pending', 'approved', 'approved', 'completed', 'completed'];
      
      for (let i = 0; i < Math.min(offers.length, 8); i++) {
        const offer = offers[i];
        
        applications.push({
          offerId: offer._id,
          brandId: offer.brandId,
          brandName: offer.brandName,
          productName: offer.productName,
          creatorId: creatorId,
          creatorName: "Vinay Prajapati",
          creatorEmail: CREATOR_EMAIL,
          status: statuses[i % statuses.length],
          message: `Hi! I'd love to collaborate on your ${offer.productName} campaign! I have great engagement in the ${offer.productCategory} niche.`,
          appliedAt: new Date(Date.now() - (i * 3 * 24 * 60 * 60 * 1000)),
          updatedAt: new Date(),
        });
      }
      
      await applicationsCol.insertMany(applications);
      console.log('✓ Seeded', applications.length, 'applications for creator');
    }
    
    // ===== SEED CREATOR STATS =====
    const statsCol = db.collection('barter_creator_stats');
    await statsCol.deleteMany({ creatorId: creatorId });
    await statsCol.insertOne({
      creatorId: creatorId,
      totalApplications: 8,
      approvedDeals: 5,
      completedDeals: 3,
      pendingApplications: 2,
      totalEarnings: 45000,
      avgRating: 4.8,
      totalReach: 150000,
      updatedAt: new Date(),
    });
    console.log('✓ Seeded creator stats');
    
    // ===== SEED NOTIFICATIONS =====
    const notificationsCol = db.collection('barter_notifications');
    await notificationsCol.deleteMany({ userId: creatorId });
    
    const notifications = [
      {
        userId: creatorId,
        type: 'application_approved',
        title: 'Application Approved! 🎉',
        message: 'Your application for Vitamin C Serum has been approved. Check your dashboard for next steps.',
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: creatorId,
        type: 'new_offer',
        title: 'New Offer Available',
        message: 'TechGear Pro has a new earbuds collaboration that matches your niche!',
        read: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId: creatorId,
        type: 'deal_completed',
        title: 'Deal Completed',
        message: 'Your collaboration with FitFuel Protein has been marked as complete. Great job!',
        read: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: creatorId,
        type: 'reminder',
        title: 'Content Deadline Reminder',
        message: 'Your content for Chai Chronicles is due in 3 days.',
        read: true,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];
    
    await notificationsCol.insertMany(notifications);
    console.log('✓ Seeded', notifications.length, 'notifications');
    
    console.log('\n🎉 Barter Creator setup complete!');
    console.log('Login at: /login-barter');
    console.log('Email:', CREATOR_EMAIL);
    console.log('Password:', CREATOR_PASSWORD);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

setupBarterCreator();

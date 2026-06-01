const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const CREATOR_EMAIL = "vinayvinayvinayvinay@gmail.com";
const CREATOR_PASSWORD = "password123";

async function seedCreator() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    
    const hashedPassword = await bcrypt.hash(CREATOR_PASSWORD, 10);
    
    // ===== 1. Create or Update Barter Creator =====
    const barterUsersCollection = db.collection('barter_users');
    
    let creator = await barterUsersCollection.findOne({ email: CREATOR_EMAIL });
    
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
    
    if (creator) {
      await barterUsersCollection.updateOne(
        { email: CREATOR_EMAIL },
        { $set: creatorData }
      );
      console.log('✓ Updated existing barter creator');
    } else {
      creatorData.createdAt = new Date();
      const result = await barterUsersCollection.insertOne(creatorData);
      creator = { _id: result.insertedId, ...creatorData };
      console.log('✓ Created new barter creator');
    }
    
    // Reload creator to get _id
    creator = await barterUsersCollection.findOne({ email: CREATOR_EMAIL });
    const creatorId = creator._id;
    
    // ===== 2. SEED BARTER OFFERS =====
    const offersCollection = db.collection('barter_offers');
    
    const existingOffers = await offersCollection.find({}).toArray();
    console.log(`Found ${existingOffers.length} existing offers`);
    
    const sampleOffers = [
      // Beauty & Skincare
      {
        brandId: new ObjectId(),
        brandName: "GlowSkin Naturals",
        brandLogo: "✨",
        brandEmail: "collab@glowskin.in",
        productName: "Vitamin C Serum (30ml)",
        productDescription: "Premium 20% Vitamin C Serum with Hyaluronic Acid and Niacinamide. Dermatologist-approved.",
        productImage: "🧴",
        productValue: 1299,
        productCategory: "Beauty",
        contentType: "reel",
        contentRequirement: "Create a 30-60 second Reel showing your morning skincare routine with the serum.",
        script: 'Hook: "My glass skin secret!" → Apply serum → Show the glow → Honest review',
        hashtags: ["#GlowSkinNaturals", "#VitaminCSerum", "#SkincareRoutine", "#GlassSkin"],
        dos: ["Film in natural lighting", "Show the product clearly", "Be authentic"],
        donts: ["No competitor products", "Don't make medical claims"],
        targetNiches: ["Beauty", "Lifestyle", "Fashion"],
        totalSlots: 20,
        filledSlots: 8,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Tech
      {
        brandId: new ObjectId(),
        brandName: "TechGear India",
        brandLogo: "🎧",
        brandEmail: "creators@techgear.in",
        productName: "AirPods Pro Clone (Premium)",
        productDescription: "High-quality TWS earbuds with ANC, transparency mode, and 30-hour battery. Perfect sound quality!",
        productImage: "🎵",
        productValue: 2499,
        productCategory: "Tech",
        contentType: "video",
        contentRequirement: "Create a 3-5 minute unboxing and review video with sound quality tests.",
        script: "Unbox → Feature walkthrough → Sound test → Compare (optionally) → Verdict",
        hashtags: ["#TechGearIndia", "#TWS", "#Earbuds", "#TechReview"],
        dos: ["Show all features", "Do honest sound comparison", "Show battery test"],
        donts: ["No false claims", "Don't show competitor logos prominently"],
        targetNiches: ["Tech", "Lifestyle", "Gaming"],
        totalSlots: 15,
        filledSlots: 3,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Fitness
      {
        brandId: new ObjectId(),
        brandName: "FitFuel Protein",
        brandLogo: "💪",
        brandEmail: "creators@fitfuel.in",
        productName: "Whey Protein Isolate - Chocolate (1kg)",
        productDescription: "Premium 90% protein isolate with 27g protein per serving. Zero added sugar!",
        productImage: "🏋️",
        productValue: 2499,
        productCategory: "Fitness",
        contentType: "video",
        contentRequirement: "Create a 2-3 minute video featuring the protein in your workout routine.",
        script: "Intro → Workout → Prepare shake → Taste test → Review",
        hashtags: ["#FitFuelProtein", "#FitnessJourney", "#ProteinShake", "#GymLife"],
        dos: ["Show workout clips", "Demonstrate mixing", "Honest taste review"],
        donts: ["No other supplements visible", "No unrealistic claims"],
        targetNiches: ["Fitness", "Health", "Lifestyle"],
        totalSlots: 15,
        filledSlots: 5,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Fashion
      {
        brandId: new ObjectId(),
        brandName: "UrbanStyle Co.",
        brandLogo: "👕",
        brandEmail: "collab@urbanstyle.in",
        productName: "Oversized Graphic Tee Collection (3 tees)",
        productDescription: "Premium cotton oversized tees with unique artwork. Street style essentials!",
        productImage: "👔",
        productValue: 1799,
        productCategory: "Fashion",
        contentType: "reel",
        contentRequirement: "Create a styling Reel showing 3 different looks with our tees.",
        script: "Outfit 1 → Transition → Outfit 2 → Transition → Outfit 3 → CTA",
        hashtags: ["#UrbanStyleCo", "#StreetStyle", "#OOTD", "#FashionReel"],
        dos: ["Creative transitions", "Show different styling", "Natural lighting"],
        donts: ["No competitor brands visible", "Don't cover the artwork"],
        targetNiches: ["Fashion", "Lifestyle", "Photography"],
        totalSlots: 30,
        filledSlots: 12,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Food
      {
        brandId: new ObjectId(),
        brandName: "SpiceCraft Kitchen",
        brandLogo: "🌶️",
        brandEmail: "influencers@spicecraft.in",
        productName: "Premium Spice Box Set (12 spices)",
        productDescription: "Handcrafted spice collection with exotic flavors from across India. Chef-quality spices!",
        productImage: "🫙",
        productValue: 1499,
        productCategory: "Food",
        contentType: "video",
        contentRequirement: "Create a recipe video using our spices. Show the cooking process!",
        script: "Unbox spices → Pick a recipe → Cook → Taste → Review",
        hashtags: ["#SpiceCraftKitchen", "#CookingWithSpices", "#IndianCuisine", "#FoodContent"],
        dos: ["Show spice quality", "Create appetizing shots", "Share the recipe"],
        donts: ["No unhygienic practices", "Don't rush the cooking"],
        targetNiches: ["Food", "Lifestyle", "Health"],
        totalSlots: 25,
        filledSlots: 10,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Gaming
      {
        brandId: new ObjectId(),
        brandName: "GameZone Pro",
        brandLogo: "🎮",
        brandEmail: "creators@gamezone.in",
        productName: "RGB Gaming Mouse + Mousepad Combo",
        productDescription: "16000 DPI gaming mouse with customizable RGB and XXL mousepad. Esports grade!",
        productImage: "🖱️",
        productValue: 1999,
        productCategory: "Gaming",
        contentType: "video",
        contentRequirement: "Create a gaming session video showcasing the mouse in action.",
        script: "Unbox → Setup → Gaming session → Performance review → Verdict",
        hashtags: ["#GameZonePro", "#GamingMouse", "#PCGaming", "#GamingSetup"],
        dos: ["Show RGB effects", "Gameplay footage", "DPI test"],
        donts: ["No competitor peripherals", "Don't skip the gaming footage"],
        targetNiches: ["Gaming", "Tech", "Entertainment"],
        totalSlots: 18,
        filledSlots: 6,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Lifestyle
      {
        brandId: new ObjectId(),
        brandName: "ZenHome Living",
        brandLogo: "🏠",
        brandEmail: "partners@zenhome.in",
        productName: "Minimalist Desk Organizer Set",
        productDescription: "Bamboo desk organizer with phone stand, pen holder, and cable management. Aesthetic workspace essentials!",
        productImage: "📦",
        productValue: 1299,
        productCategory: "Lifestyle",
        contentType: "reel",
        contentRequirement: "Create a desk setup/transformation Reel featuring our organizer.",
        script: "Messy desk → Organize with product → Final aesthetic setup → Review",
        hashtags: ["#ZenHomeLiving", "#DeskSetup", "#Minimalist", "#WorkFromHome"],
        dos: ["Before/after shots", "Aesthetic filming", "Show all pieces"],
        donts: ["No cluttered backgrounds", "Don't rush the reveal"],
        targetNiches: ["Lifestyle", "Tech", "Productivity"],
        totalSlots: 20,
        filledSlots: 7,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let insertedOffers = [];
    if (existingOffers.length < 5) {
      await offersCollection.insertMany(sampleOffers);
      insertedOffers = await offersCollection.find({}).toArray();
      console.log(`✓ Inserted ${sampleOffers.length} new offers`);
    } else {
      insertedOffers = existingOffers;
      console.log(`✓ Using ${existingOffers.length} existing offers`);
    }

    // ===== 3. CREATE APPLICATIONS FOR THIS CREATOR =====
    const applicationsCollection = db.collection('barter_applications');
    
    // Delete existing applications for this creator to avoid duplicates
    await applicationsCollection.deleteMany({ creatorId: creatorId });
    console.log('✓ Cleared existing applications for this creator');
    
    const applicationStatuses = [
      { status: "pending", index: 0 },
      { status: "approved", index: 1 },
      { status: "content_pending", index: 2 },
      { status: "submitted", index: 3 },
      { status: "completed", index: 4 },
      { status: "revision_requested", index: 5 },
    ];

    const activeOffers = insertedOffers.filter(o => o.status === 'active').slice(0, 6);
    
    for (let i = 0; i < Math.min(applicationStatuses.length, activeOffers.length); i++) {
      const offer = activeOffers[i];
      const { status } = applicationStatuses[i];
      
      const now = new Date();
      const applicationData = {
        offerId: offer._id,
        creatorId: creatorId,
        creatorName: "Vinay Prajapati",
        creatorEmail: CREATOR_EMAIL,
        creatorNiche: "Tech",
        creatorFollowerCount: "100K-500K",
        creatorPrimaryPlatform: "Instagram",
        creatorSocialHandles: {
          instagram: "@vinaycreates",
          youtube: "VinayCreatorHub",
          twitter: "@vinay_content",
        },
        applicationMessage: `I'm excited to collaborate on ${offer.productName}! I have extensive experience creating engaging content for similar products.`,
        appliedAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000), // Stagger application dates
        status: status,
        statusHistory: [
          {
            status: "pending",
            changedAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
          }
        ],
        createdAt: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        updatedAt: now,
      };

      // Add status history based on final status
      if (status !== "pending") {
        applicationData.statusHistory.push({
          status: status,
          changedAt: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
          note: status === "revision_requested" ? "Please add more close-up shots of the product" : undefined,
        });
      }

      // Add content link for submitted/completed applications
      if (status === "submitted" || status === "completed") {
        applicationData.contentLink = "https://www.instagram.com/reel/example123/";
        applicationData.contentSubmittedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      }

      // Add shipping address for approved/shipped applications
      if (status === "approved" || status === "content_pending" || status === "submitted" || status === "completed") {
        applicationData.shippingAddress = {
          fullName: "Vinay Prajapati",
          phone: "9876543210",
          addressLine1: "123, Tech Park",
          addressLine2: "Whitefield",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560066",
        };
      }

      if (status === "revision_requested") {
        applicationData.revisionNotes = "Please add more close-up shots of the product";
      }

      await applicationsCollection.insertOne(applicationData);
      console.log(`✓ Created application for ${offer.productName} with status: ${status}`);
    }

    console.log('\n🎉 Successfully seeded all data for barter creator!');
    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${CREATOR_EMAIL}`);
    console.log(`   Password: ${CREATOR_PASSWORD}`);
    console.log(`   Login URL: /login-barter`);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

seedCreator();

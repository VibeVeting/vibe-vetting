import { NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterUserModel } from "@/lib/models/barter-user";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// POST - Seed complete data for specific creator
export async function POST() {
  const CREATOR_EMAIL = "vinayvinayvinayvinay@gmail.com";
  const CREATOR_PASSWORD = "password123";
  
  try {
    const results = {
      creator: null as string | null,
      offers: 0,
      applications: 0,
      errors: [] as string[]
    };

    const hashedPassword = await bcrypt.hash(CREATOR_PASSWORD, 10);

    // ===== 1. Create or Update Barter Creator =====
    let creator = await BarterUserModel.findByEmail(CREATOR_EMAIL);
    
    if (creator) {
      // Update existing creator
      await BarterUserModel.update(creator._id!.toString(), {
        name: "Vinay Prajapati",
        password: hashedPassword,
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
      });
      results.creator = "Updated existing creator";
    } else {
      // Create new creator
      creator = await BarterUserModel.create({
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
      });
      results.creator = "Created new creator";
    }

    const creatorId = creator._id!;

    // ===== 2. SEED BARTER OFFERS =====
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
        contentType: "reel" as const,
        contentRequirement: "Create a 30-60 second Reel showing your morning skincare routine with the serum.",
        script: 'Hook: "My glass skin secret!" → Apply serum → Show the glow → Honest review',
        hashtags: ["#GlowSkinNaturals", "#VitaminCSerum", "#SkincareRoutine", "#GlassSkin"],
        dos: ["Film in natural lighting", "Show the product clearly", "Be authentic"],
        donts: ["No competitor products", "Don't make medical claims"],
        targetNiches: ["Beauty", "Lifestyle", "Fashion"],
        totalSlots: 20,
        filledSlots: 8,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "video" as const,
        contentRequirement: "Create a 3-5 minute unboxing and review video with sound quality tests.",
        script: "Unbox → Feature walkthrough → Sound test → Compare (optionally) → Verdict",
        hashtags: ["#TechGearIndia", "#TWS", "#Earbuds", "#TechReview"],
        dos: ["Show all features", "Do honest sound comparison", "Show battery test"],
        donts: ["No false claims", "Don't show competitor logos prominently"],
        targetNiches: ["Tech", "Lifestyle", "Gaming"],
        totalSlots: 15,
        filledSlots: 3,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "video" as const,
        contentRequirement: "Create a 2-3 minute video featuring the protein in your workout routine.",
        script: "Intro → Workout → Prepare shake → Taste test → Review",
        hashtags: ["#FitFuelProtein", "#FitnessJourney", "#ProteinShake", "#GymLife"],
        dos: ["Show workout clips", "Demonstrate mixing", "Honest taste review"],
        donts: ["No other supplements visible", "No unrealistic claims"],
        targetNiches: ["Fitness", "Health", "Lifestyle"],
        totalSlots: 15,
        filledSlots: 5,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "reel" as const,
        contentRequirement: "Create a styling Reel showing 3 different looks with our tees.",
        script: "Outfit 1 → Transition → Outfit 2 → Transition → Outfit 3 → CTA",
        hashtags: ["#UrbanStyleCo", "#StreetStyle", "#OOTD", "#FashionReel"],
        dos: ["Creative transitions", "Show different styling", "Natural lighting"],
        donts: ["No competitor brands visible", "Don't cover the artwork"],
        targetNiches: ["Fashion", "Lifestyle", "Photography"],
        totalSlots: 30,
        filledSlots: 12,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "video" as const,
        contentRequirement: "Create a recipe video using our spices. Show the cooking process!",
        script: "Unbox spices → Pick a recipe → Cook → Taste → Review",
        hashtags: ["#SpiceCraftKitchen", "#CookingWithSpices", "#IndianCuisine", "#FoodContent"],
        dos: ["Show spice quality", "Create appetizing shots", "Share the recipe"],
        donts: ["No unhygienic practices", "Don't rush the cooking"],
        targetNiches: ["Food", "Lifestyle", "Health"],
        totalSlots: 25,
        filledSlots: 10,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "reel" as const,
        contentRequirement: "Create a desk setup/transformation Reel featuring our organizer.",
        script: "Messy desk → Organize with product → Final aesthetic setup → Review",
        hashtags: ["#ZenHomeLiving", "#DeskSetup", "#Minimalist", "#WorkFromHome"],
        dos: ["Before/after shots", "Aesthetic filming", "Show all pieces"],
        donts: ["No cluttered backgrounds", "Don't rush the reveal"],
        targetNiches: ["Lifestyle", "Tech", "Productivity"],
        totalSlots: 20,
        filledSlots: 7,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: "active" as const,
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
        contentType: "video" as const,
        contentRequirement: "Create a gaming session video showcasing the mouse in action.",
        script: "Unbox → Setup → Gaming session → Performance review → Verdict",
        hashtags: ["#GameZonePro", "#GamingMouse", "#PCGaming", "#GamingSetup"],
        dos: ["Show RGB effects", "Gameplay footage", "DPI test"],
        donts: ["No competitor peripherals", "Don't skip the gaming footage"],
        targetNiches: ["Gaming", "Tech", "Entertainment"],
        totalSlots: 18,
        filledSlots: 6,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "active" as const,
      },
      // Completed offer
      {
        brandId: new ObjectId(),
        brandName: "EcoBottle India",
        brandLogo: "🍶",
        brandEmail: "collab@ecobottle.in",
        productName: "Stainless Steel Insulated Bottle",
        productDescription: "Double-wall insulated bottle that keeps drinks cold for 24 hours. Eco-friendly alternative!",
        productImage: "🧊",
        productValue: 899,
        productCategory: "Lifestyle",
        contentType: "story" as const,
        contentRequirement: "Create Instagram stories showing the bottle in your daily routine.",
        script: "Morning use → Gym → Office → Review story",
        hashtags: ["#EcoBottleIndia", "#Sustainable", "#DailyRoutine"],
        dos: ["Show different settings", "Temperature test", "Authentic use"],
        donts: ["No plastic bottles visible", "Don't fake the test"],
        targetNiches: ["Lifestyle", "Fitness", "Health"],
        totalSlots: 40,
        filledSlots: 40,
        deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: "completed" as const,
      },
    ];

    // Insert offers
    const existingOffers = await BarterOfferModel.findAll();
    let insertedOffers: Array<{ _id: ObjectId; productName: string }> = [];
    
    if (existingOffers.length < 5) {
      for (const offerData of sampleOffers) {
        try {
          const offer = await BarterOfferModel.create(offerData);
          insertedOffers.push({ _id: offer._id!, productName: offer.productName });
          results.offers++;
        } catch (err) {
          results.errors.push(`Failed to create offer: ${offerData.productName}`);
        }
      }
    } else {
      // Use existing offers
      insertedOffers = existingOffers.slice(0, 8).map(o => ({ _id: o._id!, productName: o.productName }));
    }

    // ===== 3. CREATE APPLICATIONS FOR THIS CREATOR =====
    
    // Delete existing applications for this creator
    const existingApps = await BarterApplicationModel.findByCreator(creatorId.toString());
    
    // Create applications with various statuses
    const applicationStatuses = [
      { status: "pending" as const, index: 0 },
      { status: "approved" as const, index: 1 },
      { status: "content_pending" as const, index: 2 },
      { status: "submitted" as const, index: 3 },
      { status: "completed" as const, index: 4 },
      { status: "revision_requested" as const, index: 5 },
    ];

    // Get all active offers to apply to
    const allOffers = insertedOffers.length > 0 ? insertedOffers : (await BarterOfferModel.findAll()).slice(0, 8);
    
    for (let i = 0; i < Math.min(applicationStatuses.length, allOffers.length); i++) {
      const offer = allOffers[i];
      const { status } = applicationStatuses[i];
      
      // Check if application already exists
      const existingApp = await BarterApplicationModel.findByOfferAndCreator(
        offer._id.toString(),
        creatorId.toString()
      );
      
      if (!existingApp) {
        try {
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
          };

          const application = await BarterApplicationModel.create(applicationData);
          
          // Update status based on our test data
          if (status !== "pending") {
            await BarterApplicationModel.updateStatus(
              application._id!.toString(),
              status,
              status === "revision_requested" ? "Please add more close-up shots of the product" : undefined
            );
          }

          // Add content link for submitted/completed applications
          if (status === "submitted" || status === "completed") {
            await BarterApplicationModel.submitContent(
              application._id!.toString(),
              "https://www.instagram.com/reel/example123/"
            );
          }

          // Add shipping address for approved/shipped applications
          if (status === "approved" || status === "content_pending" || status === "submitted" || status === "completed") {
            await BarterApplicationModel.addShippingAddress(application._id!.toString(), {
              fullName: "Vinay Prajapati",
              phone: "9876543210",
              addressLine1: "123, Tech Park",
              addressLine2: "Whitefield",
              city: "Bangalore",
              state: "Karnataka",
              pincode: "560066",
            });
          }

          results.applications++;
        } catch (err) {
          results.errors.push(`Failed to create application for: ${offer.productName}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Successfully seeded barter creator data!",
      credentials: {
        email: CREATOR_EMAIL,
        password: CREATOR_PASSWORD,
        loginUrl: "/login-barter"
      },
      results
    });

  } catch (error) {
    console.error("Error seeding barter creator data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Check status
export async function GET() {
  const CREATOR_EMAIL = "vinayvinayvinayvinay@gmail.com";
  
  try {
    const creator = await BarterUserModel.findByEmail(CREATOR_EMAIL);
    
    if (!creator) {
      return NextResponse.json({
        exists: false,
        message: "Creator not found. Use POST to seed data.",
        seedUrl: "/api/barter/seed-creator (POST)"
      });
    }

    const applications = await BarterApplicationModel.findByCreator(creator._id!.toString());
    
    return NextResponse.json({
      exists: true,
      creator: {
        id: creator._id!.toString(),
        email: creator.email,
        name: creator.name,
        profile: creator.creatorProfile,
        isVerified: creator.isVerified,
      },
      applications: applications.length,
      applicationsByStatus: {
        pending: applications.filter(a => a.status === "pending").length,
        approved: applications.filter(a => a.status === "approved").length,
        content_pending: applications.filter(a => a.status === "content_pending").length,
        submitted: applications.filter(a => a.status === "submitted").length,
        completed: applications.filter(a => a.status === "completed").length,
        rejected: applications.filter(a => a.status === "rejected").length,
      },
      loginCredentials: {
        email: CREATOR_EMAIL,
        password: "password123",
        loginUrl: "/login-barter"
      }
    });
  } catch (error) {
    console.error("Error checking creator:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const COMPANY_EMAIL = "vinay91098@gmail.com";
const COMPANY_PASSWORD = "vinay91098@gmail.com";

async function setupBarterCompany() {
  const uri = 'mongodb+srv://vinay91098_db_user:JJ3NQLMpe3K2Uvu1@cluster0.hbhhpo6.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('vibe-vetting');
    const barterCompaniesCol = db.collection('barter_companies');
    
    const hashedPassword = await bcrypt.hash(COMPANY_PASSWORD, 10);
    
    // Check if barter company exists
    let company = await barterCompaniesCol.findOne({ email: COMPANY_EMAIL });
    
    const companyData = {
      email: COMPANY_EMAIL,
      password: hashedPassword,
      userType: 'barter_company',
      companyProfile: {
        companyName: 'Vinay Enterprises',
        industry: 'Technology',
        website: 'https://vinayenterprises.com',
        description: 'Leading tech company for barter collaborations with creators.',
        productsCategories: ['Technology', 'Fashion', 'Beauty', 'Lifestyle', 'Fitness'],
        monthlyBarterBudget: '100000+',
        logo: '',
        address: 'Bangalore, India',
        contactPerson: 'Vinay Prajapati',
        contactPhone: '+91 91098 91098',
        city: 'Bangalore',
        gstNumber: 'GST12345678',
        socialHandles: {
          instagram: '@vinayenterprises',
          linkedin: 'company/vinay-enterprises',
          twitter: '@vinayent',
        }
      },
      isVerified: true,
      isActive: true,
      twoFactorEnabled: false,
      updatedAt: new Date(),
    };
    
    let companyId;
    
    if (company) {
      await barterCompaniesCol.updateOne(
        { email: COMPANY_EMAIL },
        { $set: companyData }
      );
      companyId = company._id;
      console.log('✓ Updated existing barter company');
    } else {
      companyData.createdAt = new Date();
      const result = await barterCompaniesCol.insertOne(companyData);
      companyId = result.insertedId;
      console.log('✓ Created new barter company');
    }
    
    console.log('Company ID:', companyId.toString());
    
    // ===== SEED BARTER OFFERS FOR THIS COMPANY =====
    const offersCollection = db.collection('barter_offers');
    
    // Delete existing offers for this company
    await offersCollection.deleteMany({ brandId: companyId });
    
    const sampleOffers = [
      {
        brandId: companyId,
        brandName: "Vinay Enterprises",
        brandLogo: "🚀",
        brandEmail: COMPANY_EMAIL,
        productName: "Premium Wireless Earbuds",
        productDescription: "High-quality TWS earbuds with ANC, transparency mode, and 30-hour battery life.",
        productImage: "🎧",
        productValue: 2999,
        productCategory: "Tech",
        contentType: "video",
        contentRequirement: "Create a 3-5 minute unboxing and review video.",
        script: "Unbox → Feature walkthrough → Sound test → Verdict",
        hashtags: ["#VinayEnterprises", "#TechReview", "#Earbuds"],
        dos: ["Show all features", "Do honest sound comparison"],
        donts: ["No false claims"],
        targetNiches: ["Tech", "Lifestyle", "Gaming"],
        totalSlots: 20,
        filledSlots: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brandId: companyId,
        brandName: "Vinay Enterprises",
        brandLogo: "👕",
        brandEmail: COMPANY_EMAIL,
        productName: "Premium Cotton T-Shirt Collection",
        productDescription: "100% organic cotton t-shirts in various colors and designs.",
        productImage: "👔",
        productValue: 1499,
        productCategory: "Fashion",
        contentType: "reel",
        contentRequirement: "Create a 30-60 second styling reel showing the t-shirts.",
        script: "Hook → Show colors → Style tips → CTA",
        hashtags: ["#VinayFashion", "#OOTD", "#SustainableFashion"],
        dos: ["Show multiple styling options", "Natural lighting"],
        donts: ["No competitor products"],
        targetNiches: ["Fashion", "Lifestyle"],
        totalSlots: 30,
        filledSlots: 12,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brandId: companyId,
        brandName: "Vinay Enterprises",
        brandLogo: "💄",
        brandEmail: COMPANY_EMAIL,
        productName: "Natural Vitamin C Serum",
        productDescription: "Premium 20% Vitamin C Serum with Hyaluronic Acid for glowing skin.",
        productImage: "✨",
        productValue: 1299,
        productCategory: "Beauty",
        contentType: "reel",
        contentRequirement: "Create a skincare routine reel featuring the serum.",
        script: "Morning routine → Apply serum → Show the glow",
        hashtags: ["#VinayBeauty", "#SkincareRoutine", "#GlassSkin"],
        dos: ["Film in natural lighting", "Be authentic"],
        donts: ["No medical claims"],
        targetNiches: ["Beauty", "Lifestyle"],
        totalSlots: 25,
        filledSlots: 8,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brandId: companyId,
        brandName: "Vinay Enterprises",
        brandLogo: "💪",
        brandEmail: COMPANY_EMAIL,
        productName: "Whey Protein Isolate - Chocolate",
        productDescription: "Premium 90% protein isolate with 27g protein per serving.",
        productImage: "🏋️",
        productValue: 2499,
        productCategory: "Fitness",
        contentType: "video",
        contentRequirement: "Create a workout + shake prep video.",
        script: "Workout → Prepare shake → Taste test → Review",
        hashtags: ["#VinayFitness", "#ProteinShake", "#GymLife"],
        dos: ["Show workout clips", "Honest taste review"],
        donts: ["No unrealistic claims"],
        targetNiches: ["Fitness", "Health", "Lifestyle"],
        totalSlots: 15,
        filledSlots: 4,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        brandId: companyId,
        brandName: "Vinay Enterprises",
        brandLogo: "🍔",
        brandEmail: COMPANY_EMAIL,
        productName: "Gourmet Food Hamper",
        productDescription: "Premium food hamper with organic snacks, sauces, and spreads.",
        productImage: "🍕",
        productValue: 1999,
        productCategory: "Food",
        contentType: "video",
        contentRequirement: "Create an unboxing and taste test video.",
        script: "Unbox → Show products → Taste each → Review",
        hashtags: ["#VinayFood", "#FoodReview", "#GourmetSnacks"],
        dos: ["Show all products", "Be authentic"],
        donts: ["No negative competitor mentions"],
        targetNiches: ["Food", "Lifestyle"],
        totalSlots: 20,
        filledSlots: 7,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    await offersCollection.insertMany(sampleOffers);
    console.log('✓ Seeded', sampleOffers.length, 'barter offers for company');
    
    // ===== SEED BARTER APPLICATIONS FOR THIS COMPANY =====
    const applicationsCol = db.collection('barter_applications');
    
    // Get some creators to create applications from
    const creatorsCol = db.collection('barter_users');
    const creators = await creatorsCol.find({ userType: 'barter_creator' }).limit(10).toArray();
    
    if (creators.length > 0) {
      // Delete existing applications for this company
      await applicationsCol.deleteMany({ brandId: companyId });
      
      const offers = await offersCollection.find({ brandId: companyId }).toArray();
      
      const applications = [];
      const statuses = ['pending', 'approved', 'rejected', 'completed'];
      
      for (let i = 0; i < Math.min(creators.length, 10); i++) {
        const creator = creators[i];
        const offer = offers[i % offers.length];
        
        applications.push({
          offerId: offer._id,
          brandId: companyId,
          creatorId: creator._id,
          creatorName: creator.name || creator.creatorProfile?.name || 'Creator ' + (i + 1),
          creatorEmail: creator.email,
          creatorProfile: creator.creatorProfile,
          status: statuses[i % statuses.length],
          message: `Hi! I'd love to collaborate on your ${offer.productName} campaign!`,
          appliedAt: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)),
          updatedAt: new Date(),
        });
      }
      
      if (applications.length > 0) {
        await applicationsCol.insertMany(applications);
        console.log('✓ Seeded', applications.length, 'barter applications');
      }
    } else {
      console.log('⚠ No creators found to create applications');
    }
    
    // ===== SEED COMPANY STATS =====
    const statsCol = db.collection('barter_company_stats');
    await statsCol.deleteMany({ companyId: companyId });
    await statsCol.insertOne({
      companyId: companyId,
      totalOffers: 5,
      activeOffers: 5,
      totalApplications: 45,
      approvedApplications: 18,
      completedDeals: 12,
      totalReach: 2500000,
      avgEngagementRate: 4.2,
      totalSaved: 85000,
      updatedAt: new Date(),
    });
    console.log('✓ Seeded company stats');
    
    // ===== UPDATE ALL OTHER OFFERS TO BE FROM THIS COMPANY =====
    const updateResult = await offersCollection.updateMany(
      { brandId: { $ne: companyId } },
      { 
        $set: { 
          brandId: companyId,
          brandEmail: COMPANY_EMAIL,
        } 
      }
    );
    console.log('✓ Updated', updateResult.modifiedCount, 'other offers to this company');
    
    console.log('\n🎉 Barter Company setup complete!');
    console.log('Login at: /login-barter-company');
    console.log('Email:', COMPANY_EMAIL);
    console.log('Password:', COMPANY_PASSWORD);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

setupBarterCompany();

import { NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { BarterUserModel } from "@/lib/models/barter-user";
import { BarterApplicationModel } from "@/lib/models/barter-application";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// GET - Check current data status
export async function GET() {
  try {
    const offers = await BarterOfferModel.findAll();
    const users = await BarterUserModel.findAll();
    
    return NextResponse.json({ 
      success: true,
      message: `Database status`,
      stats: {
        totalOffers: offers.length,
        activeOffers: offers.filter(o => o.status === 'active').length,
        totalCreators: users.length,
      },
      sampleOffers: offers.slice(0, 5).map(o => ({ 
        name: o.productName, 
        brand: o.brandName, 
        value: o.productValue,
        status: o.status 
      })),
      sampleCreators: users.slice(0, 5).map(u => ({
        name: u.name,
        email: u.email,
        niche: u.creatorProfile?.niche,
        followers: u.creatorProfile?.followerCount
      }))
    });
  } catch (error) {
    console.error("Error checking data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Seed complete mock data
export async function POST() {
  try {
    const results = {
      offers: 0,
      creators: 0,
      applications: 0,
      errors: [] as string[]
    };

    // ===== 1. SEED BARTER OFFERS (25+ brands) =====
    const sampleOffers = [
      // Beauty & Skincare
      {
        brandId: new ObjectId(),
        brandName: 'GlowSkin Naturals',
        brandLogo: '✨',
        brandEmail: 'collab@glowskin.in',
        productName: 'Vitamin C Serum (30ml)',
        productDescription: 'Premium 20% Vitamin C Serum with Hyaluronic Acid and Niacinamide. Dermatologist-approved.',
        productImage: '🧴',
        productValue: 1299,
        productCategory: 'Beauty',
        contentType: 'reel' as const,
        contentRequirement: 'Create a 30-60 second Reel showing your morning skincare routine with the serum.',
        script: 'Hook: "My glass skin secret!" → Apply serum → Show the glow → Honest review',
        hashtags: ['#GlowSkinNaturals', '#VitaminCSerum', '#SkincareRoutine', '#GlassSkin'],
        dos: ['Film in natural lighting', 'Show the product clearly', 'Be authentic'],
        donts: ['No competitor products', 'Don\'t make medical claims'],
        targetNiches: ['Beauty', 'Lifestyle', 'Fashion'],
        totalSlots: 20,
        filledSlots: 8,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Derma Essentials',
        brandLogo: '💆',
        brandEmail: 'creators@dermaessentials.in',
        productName: 'Retinol Night Cream (50g)',
        productDescription: 'Anti-aging night cream with 0.5% retinol, peptides, and ceramides. Wake up to younger skin!',
        productImage: '🌙',
        productValue: 1899,
        productCategory: 'Beauty',
        contentType: 'video' as const,
        contentRequirement: 'Create a nighttime skincare routine video featuring the retinol cream. Show 7-day results!',
        script: 'Evening routine → Apply cream → Show texture → 7-day transformation → Review',
        hashtags: ['#DermaEssentials', '#RetinolCream', '#NightRoutine', '#AntiAging'],
        dos: ['Show evening lighting', 'Demonstrate proper application', 'Document 7-day journey'],
        donts: ['No daytime use recommendation', 'Don\'t skip SPF reminder'],
        targetNiches: ['Beauty', 'Health', 'Lifestyle'],
        totalSlots: 15,
        filledSlots: 6,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Luxe Hair Co',
        brandLogo: '💇',
        brandEmail: 'collab@luxehair.in',
        productName: 'Argan Oil Hair Serum + Shampoo Set',
        productDescription: 'Moroccan argan oil serum with sulfate-free shampoo. Repair damaged hair in just 2 washes!',
        productImage: '✨',
        productValue: 1599,
        productCategory: 'Beauty',
        contentType: 'reel' as const,
        contentRequirement: 'Create a hair transformation Reel showing before/after using the products.',
        script: 'Show damaged hair → Wash with shampoo → Apply serum → Reveal transformation',
        hashtags: ['#LuxeHairCo', '#ArganOil', '#HairCare', '#HairTransformation'],
        dos: ['Show real hair texture', 'Before/after shots', 'Natural drying preferred'],
        donts: ['No heat styling in "after"', 'Don\'t use other serums'],
        targetNiches: ['Beauty', 'Fashion', 'Lifestyle'],
        totalSlots: 25,
        filledSlots: 12,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'AyurGlow Cosmetics',
        brandLogo: '🌿',
        brandEmail: 'partners@ayurglow.in',
        productName: 'Kumkumadi Tailam Face Oil',
        productDescription: 'Traditional Ayurvedic face oil with saffron, sandalwood, and 16 herbs. Luxurious glow guaranteed!',
        productImage: '🪷',
        productValue: 2299,
        productCategory: 'Beauty',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a carousel showing application routine and results over 14 days.',
        script: 'Slide 1: Product beauty shot → Slide 2: Application → Slide 3-5: Day progress → Slide 6: Final glow',
        hashtags: ['#AyurGlow', '#Kumkumadi', '#AyurvedicBeauty', '#NaturalGlow'],
        dos: ['Highlight saffron strands', 'Show traditional application', 'Document journey'],
        donts: ['Don\'t mix with other actives', 'No negative Ayurveda remarks'],
        targetNiches: ['Beauty', 'Health', 'Lifestyle'],
        totalSlots: 18,
        filledSlots: 7,
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Fitness & Health
      {
        brandId: new ObjectId(),
        brandName: 'FitFuel Protein',
        brandLogo: '💪',
        brandEmail: 'creators@fitfuel.in',
        productName: 'Whey Protein Isolate - Chocolate (1kg)',
        productDescription: 'Premium 90% protein isolate with 27g protein per serving. Zero added sugar!',
        productImage: '🏋️',
        productValue: 2499,
        productCategory: 'Fitness',
        contentType: 'video' as const,
        contentRequirement: 'Create a 2-3 minute video featuring the protein in your workout routine.',
        script: 'Intro → Workout → Prepare shake → Taste test → Review',
        hashtags: ['#FitFuelProtein', '#FitnessJourney', '#ProteinShake', '#GymLife'],
        dos: ['Show workout clips', 'Demonstrate mixing', 'Honest taste review'],
        donts: ['No other supplements visible', 'No unrealistic claims'],
        targetNiches: ['Fitness', 'Health', 'Lifestyle'],
        totalSlots: 15,
        filledSlots: 5,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'FlexBand Pro',
        brandLogo: '🏃',
        brandEmail: 'collab@flexband.in',
        productName: 'Resistance Bands Set (5 levels)',
        productDescription: 'Premium latex resistance bands with door anchor, handles, and workout guide. Home gym essential!',
        productImage: '💪',
        productValue: 999,
        productCategory: 'Fitness',
        contentType: 'reel' as const,
        contentRequirement: 'Create a quick workout Reel showing 5-7 exercises using the bands.',
        script: 'Setup bands → 5-7 exercise demos → Show different resistance levels → Results promise',
        hashtags: ['#FlexBandPro', '#HomeWorkout', '#ResistanceBands', '#FitnessMotivation'],
        dos: ['Show correct form', 'Demonstrate all levels', 'Energetic editing'],
        donts: ['Don\'t rush through exercises', 'No dangerous modifications'],
        targetNiches: ['Fitness', 'Health', 'Lifestyle'],
        totalSlots: 30,
        filledSlots: 18,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'YogaBliss Studio',
        brandLogo: '🧘',
        brandEmail: 'community@yogabliss.in',
        productName: 'Cork Yoga Mat + Props Kit',
        productDescription: 'Eco-friendly cork yoga mat with blocks and strap. Sustainably sourced!',
        productImage: '🧘‍♀️',
        productValue: 3499,
        productCategory: 'Fitness',
        contentType: 'reel' as const,
        contentRequirement: 'Create a calming yoga flow Reel using all props. Golden hour lighting preferred!',
        script: 'Sunrise shot → Unroll mat → Flow poses → Close-up texture → Namaste ending',
        hashtags: ['#YogaBliss', '#CorkYogaMat', '#MindfulMorning', '#SustainableYoga'],
        dos: ['Natural lighting', 'Show cork texture', 'Peaceful music'],
        donts: ['No fast transitions', 'No cluttered space'],
        targetNiches: ['Fitness', 'Lifestyle', 'Health'],
        totalSlots: 15,
        filledSlots: 9,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'NutriVita Supplements',
        brandLogo: '💊',
        brandEmail: 'partners@nutrivita.in',
        productName: 'Multivitamin Gummies (60 count)',
        productDescription: 'Delicious fruit-flavored gummies with 13 essential vitamins. No artificial colors!',
        productImage: '🍬',
        productValue: 799,
        productCategory: 'Health',
        contentType: 'story' as const,
        contentRequirement: 'Create a week of daily stories showing your vitamin routine and energy levels.',
        script: 'Day 1-7: Morning routine → Take gummies → Day activities → Energy check-in',
        hashtags: ['#NutriVita', '#VitaminGummies', '#DailyHealth', '#WellnessJourney'],
        dos: ['Show daily consistency', 'Genuine energy updates', 'Fun presentation'],
        donts: ['Don\'t make disease cure claims', 'No medical advice'],
        targetNiches: ['Health', 'Fitness', 'Lifestyle'],
        totalSlots: 40,
        filledSlots: 22,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Tech & Gaming
      {
        brandId: new ObjectId(),
        brandName: 'TechGear Pro',
        brandLogo: '🎧',
        brandEmail: 'partnerships@techgearpro.com',
        productName: 'ANC Wireless Earbuds Pro',
        productDescription: 'Active Noise Cancelling earbuds with 40-hour battery and spatial audio.',
        productImage: '🎵',
        productValue: 3999,
        productCategory: 'Tech',
        contentType: 'video' as const,
        contentRequirement: 'Create a detailed unboxing and review (3-5 min). Cover ANC and sound quality.',
        script: 'Unboxing → Sound test → ANC demo → Call quality → Pros/cons → Rating',
        hashtags: ['#TechGearPro', '#WirelessEarbuds', '#TechReview', '#ANCEarbuds'],
        dos: ['Test multiple genres', 'Real ANC comparison', 'Honest pros/cons'],
        donts: ['Don\'t skip build quality', 'No false claims'],
        targetNiches: ['Tech', 'Lifestyle', 'Gaming'],
        totalSlots: 12,
        filledSlots: 3,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'GameZone Elite',
        brandLogo: '🎮',
        brandEmail: 'partners@gamezone.gg',
        productName: 'RGB Mechanical Gaming Keyboard',
        productDescription: 'Hot-swappable mechanical keyboard with Cherry MX switches and per-key RGB.',
        productImage: '⌨️',
        productValue: 5499,
        productCategory: 'Gaming',
        contentType: 'video' as const,
        contentRequirement: 'Create a gaming setup video (3-5 min). Include RGB showcase and typing ASMR!',
        script: 'Unboxing → RGB demo → Typing sounds → Gaming session → Rating',
        hashtags: ['#GameZoneElite', '#MechanicalKeyboard', '#GamingSetup', '#RGBKeyboard'],
        dos: ['Dark room RGB shots', 'Include ASMR', 'Real gaming test'],
        donts: ['No loud background music during sound test', 'Don\'t skip features'],
        targetNiches: ['Gaming', 'Tech'],
        totalSlots: 10,
        filledSlots: 2,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'StreamerKit',
        brandLogo: '📹',
        brandEmail: 'collab@streamerkit.in',
        productName: 'RGB Ring Light with Phone Holder',
        productDescription: '10-inch ring light with 3 color modes, 10 brightness levels, and adjustable tripod stand.',
        productImage: '💡',
        productValue: 1499,
        productCategory: 'Tech',
        contentType: 'reel' as const,
        contentRequirement: 'Create a before/after Reel showing lighting transformation for content creation.',
        script: 'Bad lighting shot → Setup ring light → Same shot with ring light → Different modes demo',
        hashtags: ['#StreamerKit', '#RingLight', '#ContentCreation', '#LightingSetup'],
        dos: ['Show dramatic difference', 'Demo all modes', 'Include setup process'],
        donts: ['Don\'t overexpose', 'No competing products'],
        targetNiches: ['Tech', 'Lifestyle', 'Beauty'],
        totalSlots: 35,
        filledSlots: 19,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'PowerBank Plus',
        brandLogo: '🔋',
        brandEmail: 'partners@powerbankplus.in',
        productName: '20000mAh Fast Charging Power Bank',
        productDescription: 'Slim power bank with 65W PD fast charging, LED display, and 3 output ports.',
        productImage: '⚡',
        productValue: 1999,
        productCategory: 'Tech',
        contentType: 'video' as const,
        contentRequirement: 'Create a day-in-life video showing the power bank during travel/outdoor activities.',
        script: 'Morning departure → Multiple device charging → Speed test → Capacity demo → Review',
        hashtags: ['#PowerBankPlus', '#FastCharging', '#TechEssentials', '#TravelGear'],
        dos: ['Show actual charging speeds', 'Multiple device demo', 'Travel context'],
        donts: ['Don\'t fake capacity claims', 'No competitor bashing'],
        targetNiches: ['Tech', 'Travel', 'Lifestyle'],
        totalSlots: 20,
        filledSlots: 8,
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'SmartWatch Studio',
        brandLogo: '⌚',
        brandEmail: 'creators@smartwatchstudio.in',
        productName: 'Fitness Smart Watch Pro',
        productDescription: 'Advanced fitness tracker with AMOLED display, SpO2, GPS, and 14-day battery life.',
        productImage: '📱',
        productValue: 4999,
        productCategory: 'Tech',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a carousel featuring all watch faces and fitness tracking during different activities.',
        script: 'Slide 1: Watch faces → Slide 2: Running GPS → Slide 3: Gym workout → Slide 4: Sleep tracking → Slide 5: Overall review',
        hashtags: ['#SmartWatchStudio', '#FitnessTracker', '#SmartWatch', '#WearableTech'],
        dos: ['Show actual workout data', 'Multiple watch faces', 'Real GPS tracking'],
        donts: ['Don\'t fake health data', 'No medical claims'],
        targetNiches: ['Tech', 'Fitness', 'Health'],
        totalSlots: 15,
        filledSlots: 4,
        deadline: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Food & Beverages
      {
        brandId: new ObjectId(),
        brandName: 'Chai Chronicles',
        brandLogo: '☕',
        brandEmail: 'collab@chaichronicles.in',
        productName: 'Premium Masala Chai Kit (6 Flavors)',
        productDescription: 'Artisanal chai collection with 100% organic spices from Darjeeling.',
        productImage: '🍵',
        productValue: 1299,
        productCategory: 'Food',
        contentType: 'reel' as const,
        contentRequirement: 'Create a cozy chai-making Reel trying at least 2 flavors. Perfect monsoon vibes!',
        script: 'Open kit → Show flavors → Brew favorite → Steam capture → First sip → Favorite pick',
        hashtags: ['#ChaiChronicles', '#MasalaChai', '#ChaiLovers', '#CozyVibes'],
        dos: ['Capture steam', 'Try multiple flavors', 'Cozy ambiance'],
        donts: ['Don\'t rush', 'No cluttered background'],
        targetNiches: ['Food', 'Lifestyle', 'Travel'],
        totalSlots: 25,
        filledSlots: 18,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Bean There Coffee',
        brandLogo: '☕',
        brandEmail: 'collab@beanthere.in',
        productName: 'Single Origin Coffee Bundle (3 bags)',
        productDescription: 'Specialty coffee from Coorg, Chikmagalur, and Araku Valley. Freshly roasted weekly!',
        productImage: '🫘',
        productValue: 1799,
        productCategory: 'Food',
        contentType: 'video' as const,
        contentRequirement: 'Create a coffee tasting video comparing all 3 origins. Show brewing and tasting notes.',
        script: 'Intro → Brewing demo → Origin 1 taste → Origin 2 taste → Origin 3 taste → Favorite pick → Recommendation',
        hashtags: ['#BeanThereCoffee', '#IndianCoffee', '#SpecialtyCoffee', '#CoffeeLover'],
        dos: ['Show roast levels', 'Describe tasting notes', 'Compare origins'],
        donts: ['Don\'t add sugar for tasting', 'No instant coffee comparison'],
        targetNiches: ['Food', 'Lifestyle', 'Travel'],
        totalSlots: 18,
        filledSlots: 9,
        deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Snack Attack',
        brandLogo: '🍿',
        brandEmail: 'partners@snackattack.in',
        productName: 'Healthy Munchies Hamper (12 packs)',
        productDescription: 'Curated healthy snacks: makhana, ragi chips, quinoa puffs, and more. Zero guilt snacking!',
        productImage: '🥜',
        productValue: 899,
        productCategory: 'Food',
        contentType: 'story' as const,
        contentRequirement: 'Create a week of snacking stories - different snack each day with honest reactions!',
        script: 'Daily: Snack reveal → Taste test → Rating out of 5 → Would repurchase?',
        hashtags: ['#SnackAttack', '#HealthySnacks', '#GuiltFreeSnacking', '#SnackTime'],
        dos: ['Genuine reactions', 'Rate each snack', 'Show nutritional info'],
        donts: ['Don\'t fake enthusiasm', 'No unhealthy comparisons'],
        targetNiches: ['Food', 'Health', 'Lifestyle'],
        totalSlots: 50,
        filledSlots: 31,
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Organic Harvest',
        brandLogo: '🌾',
        brandEmail: 'collab@organicharvest.in',
        productName: 'Cold Pressed Oil Set (Coconut + Mustard + Groundnut)',
        productDescription: 'Traditional wood-pressed oils, single-filtered, chemical-free. Farm to table freshness!',
        productImage: '🫒',
        productValue: 1399,
        productCategory: 'Food',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a cooking carousel featuring each oil in a different regional dish.',
        script: 'Slide 1: All oils → Slide 2: South Indian coconut dish → Slide 3: Bengali mustard dish → Slide 4: Gujarati groundnut dish → Slide 5: Health benefits',
        hashtags: ['#OrganicHarvest', '#ColdPressed', '#TraditionalCooking', '#HealthyOils'],
        dos: ['Cook authentic recipes', 'Show oil texture', 'Mention health benefits'],
        donts: ['No deep frying demos', 'Don\'t compare to refined oils'],
        targetNiches: ['Food', 'Health', 'Lifestyle'],
        totalSlots: 20,
        filledSlots: 11,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Fashion & Accessories
      {
        brandId: new ObjectId(),
        brandName: 'WanderLust Bags',
        brandLogo: '🎒',
        brandEmail: 'creators@wanderlustbags.in',
        productName: 'Urban Explorer Backpack (35L)',
        productDescription: 'Premium laptop backpack with USB port, anti-theft pockets, and waterproof material.',
        productImage: '💼',
        productValue: 2199,
        productCategory: 'Fashion',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a carousel showing the bag in 3 settings: travel, office, and casual.',
        script: 'Slide 1: Hero shot → Slide 2: Travel → Slide 3: Office → Slide 4: Features → Slide 5: Review',
        hashtags: ['#WanderLustBags', '#TravelBackpack', '#OfficeStyle', '#BackpackReview'],
        dos: ['Show size reference', 'Demo USB port', 'Style differently'],
        donts: ['Don\'t overstuff', 'Show real use cases'],
        targetNiches: ['Fashion', 'Travel', 'Lifestyle', 'Tech'],
        totalSlots: 18,
        filledSlots: 6,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Artisan Threads',
        brandLogo: '👗',
        brandEmail: 'collab@artisanthreads.in',
        productName: 'Hand-Block Print Kurta Set',
        productDescription: 'Authentic Jaipur block print cotton kurta. Artisan-made, size inclusive XS-3XL.',
        productImage: '🪡',
        productValue: 2899,
        productCategory: 'Fashion',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a styling carousel: casual, festive, and office adaptations.',
        script: 'Slide 1: Hero shot → Slide 2: Print close-up → Slide 3-5: Different styles → Slide 6: Artisan story',
        hashtags: ['#ArtisanThreads', '#HandblockPrint', '#SustainableFashion', '#SlowFashion'],
        dos: ['Show print details', 'Genuine style options', 'Credit artisans'],
        donts: ['No heavy filters', 'Show actual fit'],
        targetNiches: ['Fashion', 'Lifestyle'],
        totalSlots: 12,
        filledSlots: 4,
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Sole Stories',
        brandLogo: '👟',
        brandEmail: 'partners@solestories.in',
        productName: 'Handcrafted Leather Kolhapuris',
        productDescription: 'Genuine leather kolhapuris with cushioned insole. Traditional craft, modern comfort!',
        productImage: '🩴',
        productValue: 1899,
        productCategory: 'Fashion',
        contentType: 'reel' as const,
        contentRequirement: 'Create a styling Reel showing the kolhapuris with different outfits (ethnic to fusion).',
        script: 'Unbox → Close-up craftsmanship → Outfit 1 ethnic → Outfit 2 fusion → Outfit 3 casual → Walking shot',
        hashtags: ['#SoleStories', '#Kolhapuris', '#IndianFootwear', '#TraditionalMeetsModern'],
        dos: ['Show leather quality', 'Multiple outfit styles', 'Comfortable walking shots'],
        donts: ['No indoor-only shots', 'Don\'t hide craftsmanship'],
        targetNiches: ['Fashion', 'Lifestyle', 'Travel'],
        totalSlots: 22,
        filledSlots: 14,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Shade Squad',
        brandLogo: '🕶️',
        brandEmail: 'collab@shadesquad.in',
        productName: 'Polarized Sunglasses (2 frames)',
        productDescription: 'UV400 polarized sunglasses with scratch-resistant lenses. 2 trendy frame styles included!',
        productImage: '😎',
        productValue: 1499,
        productCategory: 'Fashion',
        contentType: 'reel' as const,
        contentRequirement: 'Create a GRWM Reel styling both sunglasses with different looks.',
        script: 'Outfit 1 + Frame 1 → Transition → Outfit 2 + Frame 2 → Close-up details → Final pose',
        hashtags: ['#ShadeSquad', '#Sunglasses', '#OOTD', '#SummerStyle'],
        dos: ['Show both frames', 'Outdoor lighting', 'Trendy transitions'],
        donts: ['No indoor-only content', 'Show actual polarization'],
        targetNiches: ['Fashion', 'Lifestyle', 'Travel'],
        totalSlots: 30,
        filledSlots: 16,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Urban Threads',
        brandLogo: '👕',
        brandEmail: 'creators@urbanthreads.in',
        productName: 'Premium Oversized T-shirt (3 pack)',
        productDescription: '100% cotton oversized tees in neutral tones. Minimalist streetwear essentials!',
        productImage: '👔',
        productValue: 1299,
        productCategory: 'Fashion',
        contentType: 'video' as const,
        contentRequirement: 'Create a "one tee, five ways" styling video showing versatility.',
        script: 'Intro → Look 1: Casual → Look 2: Streetwear → Look 3: Layered → Look 4: Smart casual → Look 5: Your style',
        hashtags: ['#UrbanThreads', '#Streetwear', '#OversizedTee', '#MinimalistFashion'],
        dos: ['Show fabric quality', 'Creative styling', 'Include accessory pairings'],
        donts: ['No heavy editing', 'Show actual fit'],
        targetNiches: ['Fashion', 'Lifestyle'],
        totalSlots: 25,
        filledSlots: 10,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Home & Lifestyle
      {
        brandId: new ObjectId(),
        brandName: 'PetPal India',
        brandLogo: '🐕',
        brandEmail: 'woof@petpalindia.com',
        productName: 'Organic Dog Treats Variety Pack',
        productDescription: 'All-natural grain-free dog treats in 4 flavors. Vet-approved, no preservatives!',
        productImage: '🦴',
        productValue: 999,
        productCategory: 'Lifestyle',
        contentType: 'reel' as const,
        contentRequirement: 'Film your pet\'s GENUINE reaction to the treats! Which flavor do they love most?',
        script: 'Excited pet → Unbox → Taste test each → Favorite pick → Happy moments',
        hashtags: ['#PetPalIndia', '#DogTreats', '#PetParent', '#HealthyPets'],
        dos: ['Genuine reactions', 'Try all flavors', 'Cute moments'],
        donts: ['Don\'t force pet', 'No overfeeding'],
        targetNiches: ['Lifestyle', 'Other'],
        totalSlots: 20,
        filledSlots: 11,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Aroma Home',
        brandLogo: '🕯️',
        brandEmail: 'collab@aromahome.in',
        productName: 'Soy Candle Collection (4 scents)',
        productDescription: 'Hand-poured soy candles: Lavender Dream, Vanilla Chai, Forest Rain, Ocean Breeze. 40hr burn!',
        productImage: '✨',
        productValue: 1599,
        productCategory: 'Lifestyle',
        contentType: 'reel' as const,
        contentRequirement: 'Create a cozy evening routine Reel featuring the candles. ASMR vibes encouraged!',
        script: 'Evening setup → Light candles → Cozy activities → Close-up flames → Relaxed ending',
        hashtags: ['#AromaHome', '#SoyCandles', '#CozyVibes', '#SelfCareSunday'],
        dos: ['ASMR lighting sounds', 'Show all scents', 'Cozy aesthetic'],
        donts: ['No bright lighting', 'Safe candle placement'],
        targetNiches: ['Lifestyle', 'Beauty', 'Other'],
        totalSlots: 28,
        filledSlots: 17,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Green Thumb Gardens',
        brandLogo: '🌱',
        brandEmail: 'grow@greenthumb.in',
        productName: 'Indoor Plant Starter Kit',
        productDescription: '5 low-maintenance plants with ceramic pots, soil mix, and care guide. Perfect for beginners!',
        productImage: '🪴',
        productValue: 1899,
        productCategory: 'Lifestyle',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a plant parent journey carousel - unboxing to 30-day growth!',
        script: 'Slide 1: Unboxing → Slide 2: Potting → Slide 3-4: Week progress → Slide 5: 30-day results → Slide 6: Care tips',
        hashtags: ['#GreenThumb', '#IndoorPlants', '#PlantParent', '#UrbanJungle'],
        dos: ['Document growth', 'Share care routine', 'Show before/after'],
        donts: ['Don\'t skip watering updates', 'Honest plant health updates'],
        targetNiches: ['Lifestyle', 'Other'],
        totalSlots: 22,
        filledSlots: 8,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'StudyMate',
        brandLogo: '📚',
        brandEmail: 'creators@studymate.edu',
        productName: 'LED Desk Lamp + Planner Bundle',
        productDescription: 'Eye-care LED lamp with wireless charging + 2025 academic planner with goal tracking!',
        productImage: '💡',
        productValue: 1799,
        productCategory: 'Education',
        contentType: 'story' as const,
        contentRequirement: 'Create "Day in my Study Life" story series showing the lamp and planner in action.',
        script: 'Story 1-7: Morning setup → Planner goals → Study session → Light modes → Night study → End review',
        hashtags: ['#StudyMate', '#StudyWithMe', '#DeskSetup', '#StudentLife'],
        dos: ['Show actual routine', 'All light modes', 'Planner organization'],
        donts: ['Don\'t be too promotional', 'Authentic setup'],
        targetNiches: ['Education', 'Lifestyle'],
        totalSlots: 30,
        filledSlots: 12,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },

      // Travel
      {
        brandId: new ObjectId(),
        brandName: 'TravelEase',
        brandLogo: '✈️',
        brandEmail: 'collab@travelease.in',
        productName: 'Cabin Luggage + Toiletry Kit',
        productDescription: 'Hard-shell cabin bag with TSA lock + waterproof toiletry organizer. Travel smart!',
        productImage: '🧳',
        productValue: 3499,
        productCategory: 'Travel',
        contentType: 'video' as const,
        contentRequirement: 'Create a packing video and travel vlog segment featuring the luggage.',
        script: 'Packing demo → Airport shots → TSA lock use → Toiletry kit organization → Travel experience',
        hashtags: ['#TravelEase', '#TravelEssentials', '#CabinLuggage', '#PackWithMe'],
        dos: ['Show packing capacity', 'Airport/travel footage', 'Organize toiletry kit'],
        donts: ['Don\'t overstuff', 'No competitor luggage'],
        targetNiches: ['Travel', 'Lifestyle'],
        totalSlots: 15,
        filledSlots: 5,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Wanderer Journals',
        brandLogo: '📔',
        brandEmail: 'partners@wandererjournals.in',
        productName: 'Travel Journal + Sticker Pack',
        productDescription: 'A5 travel journal with world map, pockets, and 200+ travel-themed stickers!',
        productImage: '✍️',
        productValue: 799,
        productCategory: 'Travel',
        contentType: 'reel' as const,
        contentRequirement: 'Create a journal decorating Reel - plan a trip or document a recent adventure!',
        script: 'Open journal → Add tickets/photos → Use stickers → Write memories → Final spread reveal',
        hashtags: ['#WandererJournals', '#TravelJournal', '#Journaling', '#TravelMemories'],
        dos: ['ASMR writing sounds', 'Creative spreads', 'Show sticker variety'],
        donts: ['Don\'t rush', 'Authentic entries'],
        targetNiches: ['Travel', 'Lifestyle', 'Other'],
        totalSlots: 40,
        filledSlots: 24,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
    ];

    // Create offers
    const createdOfferIds: ObjectId[] = [];
    for (const offerData of sampleOffers) {
      try {
        const offer = await BarterOfferModel.create(offerData);
        if (offer._id) {
          createdOfferIds.push(offer._id);
          results.offers++;
        }
      } catch (err) {
        results.errors.push(`Offer: ${offerData.productName} - ${err}`);
      }
    }

    // ===== 2. SEED BARTER CREATORS (20+ creators) =====
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const sampleCreators = [
      {
        email: 'priya.sharma@gmail.com',
        name: 'Priya Sharma',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@priya.glows', youtube: 'PriyaBeautyDiaries' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Beauty',
          city: 'Mumbai',
          whyBarter: 'Love trying new skincare products!',
          barterReady: true,
        },
      },
      {
        email: 'rahul.fitness@gmail.com',
        name: 'Rahul Kapoor',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@rahul_fitlife', youtube: 'RahulFitnessIndia' },
          primaryPlatform: 'YouTube',
          followerCount: '100K-500K',
          niche: 'Fitness',
          city: 'Delhi',
          whyBarter: 'Want to review fitness products for my audience',
          barterReady: true,
        },
      },
      {
        email: 'sneha.cooks@gmail.com',
        name: 'Sneha Iyer',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@sneha_kitchen', youtube: 'SnehaRecipes' },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Food',
          city: 'Chennai',
          whyBarter: 'Excited to feature food brands',
          barterReady: true,
        },
      },
      {
        email: 'arjun.tech@gmail.com',
        name: 'Arjun Mehta',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@arjun.tech', youtube: 'TechWithArjun', twitter: '@arjuntech' },
          primaryPlatform: 'YouTube',
          followerCount: '500K-1M',
          niche: 'Tech',
          city: 'Bangalore',
          whyBarter: 'Love reviewing gadgets and tech products',
          barterReady: true,
        },
      },
      {
        email: 'ananya.travels@gmail.com',
        name: 'Ananya Reddy',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@ananya.wanderlust', youtube: 'AnanyaTravels' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Travel',
          city: 'Hyderabad',
          whyBarter: 'Always looking for travel gear to review',
          barterReady: true,
        },
      },
      {
        email: 'vikram.gaming@gmail.com',
        name: 'Vikram Singh',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@vikram_plays', youtube: 'VikramGaming', twitch: 'vikramplays' },
          primaryPlatform: 'YouTube',
          followerCount: '100K-500K',
          niche: 'Gaming',
          city: 'Pune',
          whyBarter: 'Want to showcase gaming gear',
          barterReady: true,
        },
      },
      {
        email: 'meera.style@gmail.com',
        name: 'Meera Joshi',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@meera.styles', youtube: 'MeeraFashion' },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Fashion',
          city: 'Jaipur',
          whyBarter: 'Fashion collaborations are my favorite',
          barterReady: true,
        },
      },
      {
        email: 'karan.lifestyle@gmail.com',
        name: 'Karan Malhotra',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@karan.life', youtube: 'KaranLifestyle' },
          primaryPlatform: 'Instagram',
          followerCount: '10K-50K',
          niche: 'Lifestyle',
          city: 'Mumbai',
          whyBarter: 'Growing my lifestyle content',
          barterReady: true,
        },
      },
      {
        email: 'divya.wellness@gmail.com',
        name: 'Divya Nair',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@divya.wellness', youtube: 'DivyaHealth' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Health',
          city: 'Kochi',
          whyBarter: 'Passionate about wellness products',
          barterReady: true,
        },
      },
      {
        email: 'rohan.student@gmail.com',
        name: 'Rohan Gupta',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@rohan.studies', youtube: 'RohanEducation' },
          primaryPlatform: 'YouTube',
          followerCount: '10K-50K',
          niche: 'Education',
          city: 'Delhi',
          whyBarter: 'Want to help students with product reviews',
          barterReady: true,
        },
      },
      {
        email: 'aisha.petmom@gmail.com',
        name: 'Aisha Khan',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@aisha.petlife', youtube: 'AishaPets' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Lifestyle',
          city: 'Ahmedabad',
          whyBarter: 'My fur babies need treats to review!',
          barterReady: true,
        },
      },
      {
        email: 'neha.skincare@gmail.com',
        name: 'Neha Verma',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@neha.skincarejunkie', youtube: 'NehaSkincare' },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Beauty',
          city: 'Lucknow',
          whyBarter: 'Skincare is my passion and profession',
          barterReady: true,
        },
      },
      {
        email: 'amit.foodie@gmail.com',
        name: 'Amit Patel',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@amit.foodexplorer', youtube: 'AmitEats' },
          primaryPlatform: 'YouTube',
          followerCount: '100K-500K',
          niche: 'Food',
          city: 'Surat',
          whyBarter: 'Food reviews are my specialty',
          barterReady: true,
        },
      },
      {
        email: 'riya.yoga@gmail.com',
        name: 'Riya Desai',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@riya.yogalife', youtube: 'RiyaYoga' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Fitness',
          city: 'Vadodara',
          whyBarter: 'Looking for yoga and wellness products',
          barterReady: true,
        },
      },
      {
        email: 'sanjay.gadget@gmail.com',
        name: 'Sanjay Kumar',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@sanjay.gadgets', youtube: 'SanjayTech', twitter: '@sanjaytech' },
          primaryPlatform: 'YouTube',
          followerCount: '500K-1M',
          niche: 'Tech',
          city: 'Noida',
          whyBarter: 'Tech reviewer with 5+ years experience',
          barterReady: true,
        },
      },
      {
        email: 'pooja.fashion@gmail.com',
        name: 'Pooja Menon',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@pooja.stylegram', youtube: 'PoojaFashion' },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Fashion',
          city: 'Kochi',
          whyBarter: 'Love ethnic and fusion fashion',
          barterReady: true,
        },
      },
      {
        email: 'kabir.adventure@gmail.com',
        name: 'Kabir Das',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@kabir.adventures', youtube: 'KabirExplores' },
          primaryPlatform: 'YouTube',
          followerCount: '100K-500K',
          niche: 'Travel',
          city: 'Goa',
          whyBarter: 'Adventure travel content creator',
          barterReady: true,
        },
      },
      {
        email: 'tanya.home@gmail.com',
        name: 'Tanya Srivastava',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@tanya.homedecor', youtube: 'TanyaHome' },
          primaryPlatform: 'Instagram',
          followerCount: '50K-100K',
          niche: 'Lifestyle',
          city: 'Indore',
          whyBarter: 'Home decor and lifestyle enthusiast',
          barterReady: true,
        },
      },
      {
        email: 'dev.gamer@gmail.com',
        name: 'Dev Sharma',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@dev.esports', youtube: 'DevGaming', twitch: 'devplays' },
          primaryPlatform: 'Twitch',
          followerCount: '100K-500K',
          niche: 'Gaming',
          city: 'Chandigarh',
          whyBarter: 'Esports and gaming peripherals reviewer',
          barterReady: true,
        },
      },
      {
        email: 'ishita.beauty@gmail.com',
        name: 'Ishita Aggarwal',
        password: hashedPassword,
        userType: 'barter_creator' as const,
        creatorProfile: {
          socialHandles: { instagram: '@ishita.glamour', youtube: 'IshitaMakeup' },
          primaryPlatform: 'Instagram',
          followerCount: '100K-500K',
          niche: 'Beauty',
          city: 'Chandigarh',
          whyBarter: 'Makeup artist and beauty content creator',
          barterReady: true,
        },
      },
    ];

    // Create creators
    const createdCreatorIds: ObjectId[] = [];
    for (const creatorData of sampleCreators) {
      try {
        // Check if creator already exists
        const existing = await BarterUserModel.findByEmail(creatorData.email);
        if (!existing) {
          const creator = await BarterUserModel.create(creatorData);
          if (creator._id) {
            createdCreatorIds.push(creator._id);
            results.creators++;
          }
        } else if (existing._id) {
          createdCreatorIds.push(existing._id);
        }
      } catch (err) {
        results.errors.push(`Creator: ${creatorData.email} - ${err}`);
      }
    }

    // ===== 3. SEED APPLICATIONS WITH VARIOUS STATUSES =====
    const applicationStatuses: Array<{
      status: 'pending' | 'approved' | 'rejected' | 'content_pending' | 'submitted' | 'revision_requested' | 'completed' | 'shipped';
      weight: number;
    }> = [
      { status: 'pending', weight: 25 },
      { status: 'approved', weight: 15 },
      { status: 'content_pending', weight: 15 },
      { status: 'submitted', weight: 15 },
      { status: 'revision_requested', weight: 5 },
      { status: 'completed', weight: 15 },
      { status: 'shipped', weight: 10 },
    ];

    const sampleMessages = [
      "Hi! I absolutely love your product and would be excited to create content for it. My audience is highly engaged and loves beauty/wellness content!",
      "This product aligns perfectly with my content style. I have experience creating similar branded content with great results!",
      "I've been following your brand for a while and would love to collaborate. My followers trust my recommendations!",
      "I think my creative approach would be perfect for showcasing your product. Looking forward to this opportunity!",
      "Your product fits my niche perfectly! I have several content ideas that would resonate with my audience.",
      "Excited about this collaboration! I can create authentic content that highlights the best features of your product.",
      "As a micro-influencer, I have a highly engaged community that trusts my recommendations. Would love to feature your product!",
      "This is exactly the kind of brand I want to work with. My content style would complement your product beautifully!",
    ];

    const contentLinks = [
      "https://www.instagram.com/reel/abc123/",
      "https://www.youtube.com/watch?v=xyz789",
      "https://www.instagram.com/p/def456/",
      "https://www.youtube.com/shorts/ghi321",
      "https://www.instagram.com/reel/jkl654/",
    ];

    const feedbackMessages = [
      "Great content! Loved the authentic approach. We'd love to work with you again!",
      "Excellent work! The product was showcased beautifully. Approved for shipping.",
      "Good job! Minor suggestion - next time add more close-up shots of the product.",
      "Amazing content quality! Your audience engagement on this post was impressive.",
      "Perfect execution of the brief! Thank you for being so creative.",
    ];

    const revisionNotes = [
      "Please reshoot with better lighting and include the product packaging more clearly.",
      "Good attempt! Can you add the required hashtags and mention the key benefits?",
      "Loved the concept but need 2-3 more shots showcasing the product features.",
    ];

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Jaipur'];
    const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Maharashtra', 'West Bengal', 'Rajasthan'];

    // Create applications - each creator applies to 3-5 random offers
    const allOffers = await BarterOfferModel.findAll();
    const allCreators = await BarterUserModel.findAll();

    for (const creator of allCreators) {
      if (!creator._id) continue;
      
      // Pick 3-5 random offers for this creator
      const numApplications = Math.floor(Math.random() * 3) + 3;
      const shuffledOffers = [...allOffers].sort(() => Math.random() - 0.5);
      const selectedOffers = shuffledOffers.slice(0, Math.min(numApplications, shuffledOffers.length));

      for (const offer of selectedOffers) {
        if (!offer._id) continue;

        try {
          // Check if application already exists
          const existing = await BarterApplicationModel.findByOfferAndCreator(
            offer._id.toString(),
            creator._id.toString()
          );
          if (existing) continue;

          // Select a weighted random status
          const totalWeight = applicationStatuses.reduce((sum, s) => sum + s.weight, 0);
          let random = Math.random() * totalWeight;
          let selectedStatus = applicationStatuses[0].status;
          for (const s of applicationStatuses) {
            random -= s.weight;
            if (random <= 0) {
              selectedStatus = s.status;
              break;
            }
          }

          const applicationData = {
            offerId: offer._id,
            creatorId: creator._id,
            creatorName: creator.name,
            creatorEmail: creator.email,
            creatorNiche: creator.creatorProfile?.niche || 'Lifestyle',
            creatorFollowerCount: creator.creatorProfile?.followerCount || '10K-50K',
            creatorPrimaryPlatform: creator.creatorProfile?.primaryPlatform || 'Instagram',
            creatorSocialHandles: creator.creatorProfile?.socialHandles || {},
            applicationMessage: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
          };

          // Create the application
          const application = await BarterApplicationModel.create(applicationData);
          if (!application._id) continue;

          // Update status based on selected status
          const appId = application._id.toString();
          
          if (selectedStatus === 'pending') {
            // Already pending, no update needed
          } else if (selectedStatus === 'approved' || selectedStatus === 'content_pending') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Your application has been approved!');
            if (selectedStatus === 'content_pending') {
              await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Please submit your content.');
            }
          } else if (selectedStatus === 'submitted' || selectedStatus === 'completed' || selectedStatus === 'shipped') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Application approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Please submit content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
            
            if (selectedStatus === 'completed' || selectedStatus === 'shipped') {
              await BarterApplicationModel.updateStatus(appId, 'completed', feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
              
              if (selectedStatus === 'shipped') {
                const cityIndex = Math.floor(Math.random() * cities.length);
                const shippingAddress = {
                  fullName: creator.name,
                  phone: '+91 ' + Math.floor(Math.random() * 9000000000 + 1000000000),
                  addressLine1: `${Math.floor(Math.random() * 999) + 1}, Random Street`,
                  addressLine2: `Near Landmark, Sector ${Math.floor(Math.random() * 50) + 1}`,
                  city: cities[cityIndex],
                  state: states[cityIndex],
                  pincode: String(Math.floor(Math.random() * 900000) + 100000),
                };
                await BarterApplicationModel.updateShippingAddress(appId, shippingAddress);
                await BarterApplicationModel.markShipped(appId, `TRACK${Math.floor(Math.random() * 900000000) + 100000000}`);
              }
            }
          } else if (selectedStatus === 'revision_requested') {
            await BarterApplicationModel.updateStatus(appId, 'approved', 'Application approved!');
            await BarterApplicationModel.updateStatus(appId, 'content_pending', 'Please submit content.');
            await BarterApplicationModel.submitContent(appId, contentLinks[Math.floor(Math.random() * contentLinks.length)]);
            await BarterApplicationModel.updateStatus(appId, 'revision_requested', revisionNotes[Math.floor(Math.random() * revisionNotes.length)]);
          } else if (selectedStatus === 'rejected') {
            await BarterApplicationModel.updateStatus(appId, 'rejected', 'Sorry, your application was not selected this time.');
          }

          results.applications++;
        } catch (err) {
          results.errors.push(`Application: ${creator.email} -> ${offer.productName} - ${err}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully seeded barter mock data!',
      results: {
        offersCreated: results.offers,
        creatorsCreated: results.creators,
        applicationsCreated: results.applications,
        totalOffers: allOffers.length + results.offers,
        totalCreators: allCreators.length,
        errors: results.errors.slice(0, 10), // Only show first 10 errors
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Error seeding barter data:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Clear all barter data (use with caution!)
export async function DELETE() {
  try {
    // This would delete all barter data - implement if needed
    return NextResponse.json({
      success: false,
      message: 'DELETE not implemented for safety. Use MongoDB directly if needed.',
    }, { status: 405 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

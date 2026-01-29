import { NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { ObjectId } from "mongodb";

// GET - Check seed status
export async function GET() {
  try {
    const offers = await BarterOfferModel.findActive();
    return NextResponse.json({ 
      success: true,
      message: `Currently ${offers.length} active offers in database`,
      count: offers.length,
      offers: offers.slice(0, 5).map(o => ({ name: o.productName, brand: o.brandName, value: o.productValue }))
    });
  } catch (error) {
    console.error("Error checking offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Seed sample barter offers
export async function POST() {
  try {
    const sampleOffers = [
      {
        brandId: new ObjectId(),
        brandName: 'GlowSkin Naturals',
        brandLogo: '✨',
        brandEmail: 'collab@glowskin.in',
        productName: 'Vitamin C Serum (30ml)',
        productDescription: 'Premium 20% Vitamin C Serum with Hyaluronic Acid and Niacinamide. Dermatologist-approved formula for glowing, youthful skin.',
        productImage: '🧴',
        productValue: 1299,
        productCategory: 'Beauty',
        contentType: 'reel' as const,
        contentRequirement: 'Create a 30-60 second Reel showing your morning skincare routine. Apply 2-3 drops of serum on clean face, show the texture and absorption, and end with your honest review of the glow!',
        script: 'Hook: "My glass skin secret revealed!" → Show clean face → Apply serum drops → Gentle patting motion → Show the glow → Share genuine thoughts',
        hashtags: ['#GlowSkinNaturals', '#VitaminCSerum', '#SkincareRoutine', '#GlassSkin', '#IndianSkincare'],
        dos: ['Film in natural lighting', 'Show the product clearly', 'Mention key benefits', 'Be authentic and genuine', 'Show before/after glow'],
        donts: ['No competitor products in frame', 'Don\'t make medical claims', 'No heavy filters that hide skin texture'],
        targetNiches: ['Beauty', 'Lifestyle', 'Fashion'],
        totalSlots: 20,
        filledSlots: 8,
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'FitFuel Protein',
        brandLogo: '💪',
        brandEmail: 'creators@fitfuel.in',
        productName: 'Whey Protein Isolate - Chocolate (1kg)',
        productDescription: 'Premium 90% protein isolate with 27g protein per serving. Zero added sugar, fast absorbing, incredibly smooth taste. Perfect post-workout fuel!',
        productImage: '🏋️',
        productValue: 2499,
        productCategory: 'Fitness',
        contentType: 'video' as const,
        contentRequirement: 'Create a 2-3 minute video featuring the protein in your workout routine. Show shake preparation, taste test, and post-workout consumption. Share your fitness journey authentically!',
        script: 'Intro → Workout montage → Show product packaging → Prepare shake (mixing demo) → Taste test reaction → Mention protein content → Your honest review → Call to action',
        hashtags: ['#FitFuelProtein', '#FitnessJourney', '#ProteinShake', '#IndianFitness', '#GymLife'],
        dos: ['Show product packaging clearly', 'Demonstrate easy mixing', 'Share actual taste review', 'Mention 27g protein content', 'Include workout clips'],
        donts: ['No other supplement brands visible', 'Don\'t skip showing the product', 'No unrealistic body transformation claims'],
        targetNiches: ['Fitness', 'Health', 'Lifestyle'],
        totalSlots: 15,
        filledSlots: 5,
        deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'TechGear Pro',
        brandLogo: '🎧',
        brandEmail: 'partnerships@techgearpro.com',
        productName: 'ANC Wireless Earbuds Pro',
        productDescription: 'Premium Active Noise Cancelling earbuds with 40-hour battery life, spatial audio, crystal-clear call quality, and IPX5 water resistance for workouts.',
        productImage: '🎵',
        productValue: 3999,
        productCategory: 'Tech',
        contentType: 'video' as const,
        contentRequirement: 'Create a detailed unboxing and review video (3-5 min). Cover sound quality with different music genres, ANC demo in noisy environment, call quality test, and battery life experience.',
        script: 'Unboxing → First impressions → Sound test (multiple genres) → ANC comparison (on/off) → Call quality demo → Pros & cons → Final rating out of 10',
        hashtags: ['#TechGearPro', '#WirelessEarbuds', '#TechReview', '#ANCEarbuds', '#IndianTechReviewer'],
        dos: ['Show detailed unboxing', 'Test with multiple music genres', 'Demonstrate ANC in real noisy environment', 'Include honest pros and cons'],
        donts: ['Don\'t skip showing build quality', 'No false battery claims', 'Don\'t ignore any cons'],
        targetNiches: ['Tech', 'Lifestyle', 'Gaming'],
        totalSlots: 12,
        filledSlots: 3,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Chai Chronicles',
        brandLogo: '☕',
        brandEmail: 'collab@chaichronicles.in',
        productName: 'Premium Masala Chai Kit (6 Flavors)',
        productDescription: 'Artisanal chai collection: Cardamom Bliss, Ginger Kick, Kashmiri Kahwa, Classic Masala, Rose Saffron, and Tulsi Immunity. 100% organic spices, handcrafted in Darjeeling.',
        productImage: '🍵',
        productValue: 1299,
        productCategory: 'Food',
        contentType: 'reel' as const,
        contentRequirement: 'Create a cozy chai-making Reel trying at least 2 flavors. Show the brewing process, capture the steam and aroma, first sip reaction. Perfect for monsoon/winter vibes!',
        script: 'Open kit → Show all 6 flavors → Brew your favorite → Capture steam rising → First sip reaction → Which flavor wins? → Cozy ending shot',
        hashtags: ['#ChaiChronicles', '#MasalaChai', '#ChaiLovers', '#IndianTea', '#CozyVibes'],
        dos: ['Show brewing process aesthetically', 'Capture the steam/aroma', 'Try multiple flavors', 'Create cozy ambiance', 'Natural lighting preferred'],
        donts: ['Don\'t rush the content', 'No cluttered background', 'Don\'t skip showing product packaging'],
        targetNiches: ['Food', 'Lifestyle', 'Travel'],
        totalSlots: 25,
        filledSlots: 18,
        deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Urgent!
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'WanderLust Bags',
        brandLogo: '🎒',
        brandEmail: 'creators@wanderlustbags.in',
        productName: 'Urban Explorer Backpack (35L)',
        productDescription: 'Premium laptop backpack with USB charging port, anti-theft hidden pockets, waterproof material, and ergonomic support. Perfect for travel, office, and college!',
        productImage: '💼',
        productValue: 2199,
        productCategory: 'Fashion',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a carousel post showing the bag in 3 settings: travel mode, office/professional, and casual day out. Highlight USB port, hidden pockets, laptop compartment, and waterproof feature.',
        script: 'Slide 1: Hero shot with you → Slide 2: Travel setting → Slide 3: Office/laptop fit → Slide 4: Features close-up (USB, pockets) → Slide 5: Your recommendation',
        hashtags: ['#WanderLustBags', '#TravelBackpack', '#OfficeStyle', '#StudentLife', '#BackpackReview'],
        dos: ['Show size reference with laptop', 'Demonstrate USB charging port', 'Style in different outfits', 'Show waterproof test if possible'],
        donts: ['Don\'t overstuff the bag', 'Don\'t skip feature highlights', 'Avoid only studio shots - show real use'],
        targetNiches: ['Fashion', 'Travel', 'Lifestyle', 'Tech'],
        totalSlots: 18,
        filledSlots: 6,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'GameZone Elite',
        brandLogo: '🎮',
        brandEmail: 'partners@gamezone.gg',
        productName: 'RGB Mechanical Gaming Keyboard',
        productDescription: 'Hot-swappable mechanical keyboard with Cherry MX Blue switches, per-key RGB customization, aluminum frame, dedicated media keys, and wrist rest included.',
        productImage: '⌨️',
        productValue: 5499,
        productCategory: 'Gaming',
        contentType: 'video' as const,
        contentRequirement: 'Create a gaming setup video (3-5 min). Include unboxing, RGB customization demo in dark room, typing ASMR test, gaming session footage, and honest review.',
        script: 'Unboxing → Setup on desk → RGB showcase (dark room) → Typing sound test (ASMR style) → Actual gaming session → Hot-swap demo → Final thoughts & rating',
        hashtags: ['#GameZoneElite', '#MechanicalKeyboard', '#GamingSetup', '#RGBKeyboard', '#IndianGamer'],
        dos: ['Show RGB effects in dark room', 'Include typing ASMR section', 'Test in actual games', 'Show hot-swap feature if possible', 'Include wrist rest'],
        donts: ['Don\'t skip sound comparison with stock keyboard', 'Don\'t just show, explain features', 'No loud background music during sound test'],
        targetNiches: ['Gaming', 'Tech'],
        totalSlots: 10,
        filledSlots: 2,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'YogaBliss Studio',
        brandLogo: '🧘',
        brandEmail: 'community@yogabliss.in',
        productName: 'Cork Yoga Mat + Props Kit',
        productDescription: 'Eco-friendly cork yoga mat with natural rubber base, includes 2 cork blocks and cotton strap. Non-slip, antimicrobial, and sustainably sourced from Portugal.',
        productImage: '🧘‍♀️',
        productValue: 3499,
        productCategory: 'Fitness',
        contentType: 'reel' as const,
        contentRequirement: 'Create a calming yoga flow Reel (30-60 sec) using all props. Show 3-5 poses demonstrating grip and stability. Morning golden hour lighting preferred!',
        script: 'Sunrise/peaceful shot → Unroll mat → Flow through poses using blocks/strap → Close-up of cork texture → Peaceful ending with namaste',
        hashtags: ['#YogaBliss', '#CorkYogaMat', '#YogaProps', '#MindfulMorning', '#SustainableYoga'],
        dos: ['Film in natural/golden hour light', 'Show cork texture close-up', 'Demonstrate block and strap use', 'Peaceful/calming music', 'Mention eco-friendly aspect'],
        donts: ['No fast jarring transitions', 'Don\'t film in cluttered space', 'No loud energetic music'],
        targetNiches: ['Fitness', 'Lifestyle', 'Health'],
        totalSlots: 15,
        filledSlots: 9,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'StudyMate',
        brandLogo: '📚',
        brandEmail: 'creators@studymate.edu',
        productName: 'LED Desk Lamp + Planner Bundle',
        productDescription: 'Eye-care LED lamp with 5 brightness levels, color temperature control, USB charging port, wireless charging pad, plus 2025 academic planner with goal tracking!',
        productImage: '💡',
        productValue: 1799,
        productCategory: 'Education',
        contentType: 'story' as const,
        contentRequirement: 'Create "Day in my Study Life" story series (5-7 stories). Show the lamp and planner in your actual study routine. Make it authentic and relatable for students!',
        script: 'Story 1: Morning setup → Story 2: Planner goals → Story 3: Study session with lamp → Story 4: Different light modes → Story 5: Night study ambiance → Story 6: End of day review → Story 7: Product recommendation',
        hashtags: ['#StudyMate', '#StudyWithMe', '#DeskSetup', '#StudentLife', '#StudyTips'],
        dos: ['Show actual study routine', 'Demonstrate all light modes', 'Share planner organization tips', 'Be authentic and relatable', 'Include both day and night shots'],
        donts: ['Don\'t make it feel too promotional', 'Don\'t skip showing features in action', 'No fake productivity setups'],
        targetNiches: ['Education', 'Lifestyle'],
        totalSlots: 30,
        filledSlots: 12,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'Artisan Threads',
        brandLogo: '👗',
        brandEmail: 'collab@artisanthreads.in',
        productName: 'Hand-Block Print Kurta Set',
        productDescription: 'Authentic Jaipur hand-block printed cotton kurta with palazzo pants. Natural vegetable dyes, artisan-made. Size inclusive from XS to 3XL. Sustainable fashion!',
        productImage: '🪡',
        productValue: 2899,
        productCategory: 'Fashion',
        contentType: 'carousel' as const,
        contentRequirement: 'Create a styling carousel showing the kurta set in 3 different ways: casual brunch, festive occasion, and office/formal. Highlight the print details and craftsmanship story.',
        script: 'Slide 1: Full look hero shot → Slide 2: Print close-up details → Slide 3: Casual styling → Slide 4: Festive look with jewelry → Slide 5: Office adaptation → Slide 6: Artisan story mention',
        hashtags: ['#ArtisanThreads', '#HandblockPrint', '#SustainableFashion', '#IndianWear', '#SlowFashion'],
        dos: ['Show print details in close-up', 'Style in genuinely different ways', 'Mention comfort and fabric quality', 'Credit artisan craft', 'Show actual fit'],
        donts: ['No heavy editing/filters', 'Don\'t hide the actual print pattern', 'No comparison with other brands'],
        targetNiches: ['Fashion', 'Lifestyle'],
        totalSlots: 12,
        filledSlots: 4,
        deadline: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'PetPal India',
        brandLogo: '🐕',
        brandEmail: 'woof@petpalindia.com',
        productName: 'Organic Dog Treats Variety Pack',
        productDescription: 'All-natural grain-free dog treats: Chicken Sweet Potato, Salmon Blueberry, Peanut Butter Crunch, and Veggie Bites. Vet-approved, no preservatives, tail-wagging good!',
        productImage: '🦴',
        productValue: 999,
        productCategory: 'Lifestyle',
        contentType: 'reel' as const,
        contentRequirement: 'Film your pet\'s GENUINE reaction trying different treats! Show unboxing, let your furry friend choose their favorite, capture happy moments. Must feature real, unscripted pet reactions!',
        script: 'Show excited pet → Unbox the pack → Let them sniff → Taste test each flavor → Which one do they go crazy for? → Happy pet montage → Your recommendation',
        hashtags: ['#PetPalIndia', '#DogTreats', '#PetParent', '#DogsOfIndia', '#HealthyPets'],
        dos: ['Capture genuine pet reactions', 'Try all flavors on camera', 'Mention natural ingredients', 'Include cute/funny moments', 'Show pet enjoying treats'],
        donts: ['Don\'t force pet to perform', 'Don\'t overfeed for content', 'No artificial editing of reactions'],
        targetNiches: ['Lifestyle', 'Other'],
        totalSlots: 20,
        filledSlots: 11,
        deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
    ];

    // Create offers
    let seededCount = 0;
    for (const offerData of sampleOffers) {
      try {
        await BarterOfferModel.create(offerData);
        seededCount++;
      } catch (err) {
        console.error("Error creating offer:", offerData.productName, err);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully seeded ${seededCount} barter offers!`,
      count: seededCount
    }, { status: 201 });
  } catch (error) {
    console.error("Error seeding barter offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

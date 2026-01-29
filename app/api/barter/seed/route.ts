import { NextResponse } from "next/server";
import { BarterOfferModel } from "@/lib/models/barter-offer";
import { ObjectId } from "mongodb";

// Seed sample barter offers
export async function POST() {
  try {
    const sampleOffers = [
      {
        brandId: new ObjectId(),
        brandName: 'GlowSkin Naturals',
        brandLogo: '🧴',
        productName: 'Vitamin C Serum (30ml)',
        productDescription: 'Premium Vitamin C Serum with Hyaluronic Acid for glowing, youthful skin',
        productImage: '✨',
        productValue: 1299,
        productCategory: 'Beauty & Skincare',
        contentType: 'reel' as const,
        contentRequirement: 'Instagram Reel (30-60 sec)',
        script: 'Show your morning skincare routine. Start with clean face, apply 2-3 drops of serum, and show the glow! Mention benefits: brightening, anti-aging, and hydration. End with your honest review.',
        hashtags: ['#GlowSkinNaturals', '#VitaminCSerum', '#SkincareRoutine', '#Ad'],
        dos: ['Show the product clearly', 'Mention key benefits', 'Be authentic and genuine', 'Good lighting is must'],
        donts: ['No competitor products in frame', 'Don\'t make medical claims', 'No filters that hide skin'],
        targetNiches: ['Beauty', 'Lifestyle', 'Fashion'],
        totalSlots: 20,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'FitFuel Protein',
        brandLogo: '💪',
        productName: 'Whey Protein Chocolate (1kg)',
        productDescription: 'Premium whey protein with 24g protein per serving',
        productImage: '🏋️',
        productValue: 2499,
        productCategory: 'Fitness & Health',
        contentType: 'video' as const,
        contentRequirement: 'YouTube Short or Long Video',
        script: 'Create a workout video featuring the protein shake. Show preparation, taste test, and post-workout consumption. Share your fitness journey and how protein helps.',
        hashtags: ['#FitFuelProtein', '#FitnessJourney', '#ProteinShake', '#Sponsored'],
        dos: ['Show product packaging', 'Demonstrate mixing', 'Share taste review', 'Mention protein content'],
        donts: ['No other supplement brands', 'Don\'t skip showing the product', 'No negative health claims'],
        targetNiches: ['Fitness', 'Health', 'Lifestyle'],
        totalSlots: 15,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'TechGear India',
        brandLogo: '📱',
        productName: 'Wireless Earbuds Pro',
        productDescription: 'True wireless earbuds with ANC and 30hr battery life',
        productImage: '🎧',
        productValue: 1999,
        productCategory: 'Tech & Gadgets',
        contentType: 'photo' as const,
        contentRequirement: 'Instagram Photo Post (Carousel)',
        script: 'Create a carousel post: 1) Unboxing shot 2) Product close-up 3) You wearing them 4) Lifestyle shot. Caption should cover sound quality, battery life, and comfort.',
        hashtags: ['#TechGearIndia', '#WirelessEarbuds', '#TechReview', '#Collab'],
        dos: ['High quality photos', 'Show product details', 'Lifestyle integration', 'Honest caption'],
        donts: ['No competitor products', 'No low quality images', 'Don\'t hide the product'],
        targetNiches: ['Tech', 'Lifestyle', 'Gaming'],
        totalSlots: 30,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'HomeBrew Coffee',
        brandLogo: '☕',
        productName: 'Premium Arabica Beans (250g)',
        productDescription: 'Single origin Arabica beans from Coorg, Karnataka',
        productImage: '🫘',
        productValue: 599,
        productCategory: 'Food & Beverages',
        contentType: 'reel' as const,
        contentRequirement: 'Instagram Reel (15-30 sec)',
        script: 'Morning coffee routine! Show brewing process, the aroma appreciation moment, and first sip reaction. Cozy vibes are perfect for this content.',
        hashtags: ['#HomeBrewCoffee', '#CoffeeLover', '#MorningRoutine', '#Ad'],
        dos: ['Aesthetic setup', 'Show brewing process', 'Genuine reaction', 'Tag the brand'],
        donts: ['No other coffee brands', 'Don\'t rush the content', 'No cluttered background'],
        targetNiches: ['Food', 'Lifestyle', 'Travel'],
        totalSlots: 25,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'StyleStreet Fashion',
        brandLogo: '👗',
        productName: 'Summer Collection Outfit Set',
        productDescription: 'Trendy summer outfit with matching accessories',
        productImage: '👚',
        productValue: 1799,
        productCategory: 'Fashion',
        contentType: 'reel' as const,
        contentRequirement: 'Instagram Reel with outfit transition',
        script: 'Create an outfit transition reel. Start with casual look, transition to the StyleStreet outfit. Show different angles and styling tips.',
        hashtags: ['#StyleStreetFashion', '#OutfitOfTheDay', '#FashionReel', '#Collab'],
        dos: ['Show full outfit', 'Multiple angles', 'Styling tips', 'Good music sync'],
        donts: ['No competitor brands visible', 'No heavy filters', 'Don\'t obscure the outfit'],
        targetNiches: ['Fashion', 'Lifestyle', 'Beauty'],
        totalSlots: 40,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
      {
        brandId: new ObjectId(),
        brandName: 'AyurLife Wellness',
        brandLogo: '🌿',
        productName: 'Immunity Booster Kit',
        productDescription: 'Ayurvedic immunity boosting supplements combo',
        productImage: '💊',
        productValue: 899,
        productCategory: 'Health & Wellness',
        contentType: 'story' as const,
        contentRequirement: 'Instagram Stories (3-5 slides)',
        script: 'Document your morning wellness routine with AyurLife products. Show unboxing, product usage, and share the benefits in story format.',
        hashtags: ['#AyurLife', '#WellnessRoutine', '#ImmunityBoost', '#Ad'],
        dos: ['Show all products', 'Natural lighting', 'Share personal experience', 'Swipe up link if available'],
        donts: ['No medical claims', 'Don\'t use filters', 'No negative comparisons'],
        targetNiches: ['Health', 'Wellness', 'Lifestyle'],
        totalSlots: 50,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        status: 'active' as const,
      },
    ];

    // Create offers
    for (const offerData of sampleOffers) {
      await BarterOfferModel.create(offerData);
    }

    return NextResponse.json({ 
      message: `Successfully seeded ${sampleOffers.length} barter offers` 
    }, { status: 201 });
  } catch (error) {
    console.error("Error seeding barter offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

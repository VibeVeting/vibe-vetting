import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "vibe-vetting";

// Sample company data representing various industries and stages
const sampleCompanies = [
  {
    companyName: "Vibe Vetting",
    location: "Bangalore, India",
    continent: "North America",
    region: "California",
    revenue_range: "$1M-$10M",
    employee_range: "11-50",
    total_funding_amount_usd: 5000000,
    last_funding_date: "2024-06",
    funding_types: ["Seed", "Angel"],
    industry: "Marketing Technology",
    description: "AI-powered influencer vetting and campaign management platform for brands and agencies.",
    brandInfo: {
      marketPosition: "Emerging Market Leader",
      targetAudience: "Marketing teams and agencies managing influencer campaigns"
    }
  },
  {
    companyName: "TechFlow AI",
    location: "New York, NY",
    continent: "North America",
    region: "New York",
    revenue_range: "$10M-$50M",
    employee_range: "51-100",
    total_funding_amount_usd: 25000000,
    last_funding_date: "2024-03",
    funding_types: ["Seed", "Series A", "Series B"],
    industry: "Artificial Intelligence",
    description: "Enterprise AI solutions for workflow automation and business intelligence.",
    brandInfo: {
      marketPosition: "Growth Stage Leader",
      targetAudience: "Enterprise companies seeking AI transformation"
    }
  },
  {
    companyName: "GreenLeaf Commerce",
    location: "Austin, TX",
    continent: "North America",
    region: "Texas",
    revenue_range: "$5M-$10M",
    employee_range: "25-50",
    total_funding_amount_usd: 8000000,
    last_funding_date: "2024-01",
    funding_types: ["Seed", "Series A"],
    industry: "E-commerce",
    description: "Sustainable e-commerce platform connecting eco-conscious consumers with green products.",
    brandInfo: {
      marketPosition: "Niche Market Leader",
      targetAudience: "Environmentally conscious consumers aged 25-45"
    }
  },
  {
    companyName: "HealthPulse",
    location: "Boston, MA",
    continent: "North America",
    region: "Massachusetts",
    revenue_range: "$50M-$100M",
    employee_range: "200-500",
    total_funding_amount_usd: 75000000,
    last_funding_date: "2023-11",
    funding_types: ["Seed", "Series A", "Series B", "Series C"],
    industry: "Healthcare Technology",
    description: "Digital health platform providing telemedicine and patient engagement solutions.",
    brandInfo: {
      marketPosition: "Market Leader",
      targetAudience: "Healthcare providers and patients seeking digital health solutions"
    }
  },
  {
    companyName: "FinEdge",
    location: "London, UK",
    continent: "Europe",
    region: "United Kingdom",
    revenue_range: "$20M-$50M",
    employee_range: "100-200",
    total_funding_amount_usd: 40000000,
    last_funding_date: "2024-02",
    funding_types: ["Seed", "Series A", "Series B"],
    industry: "Financial Technology",
    description: "Next-generation payment processing and banking infrastructure for businesses.",
    brandInfo: {
      marketPosition: "Challenger",
      targetAudience: "SMBs and enterprises needing modern financial infrastructure"
    }
  },
  {
    companyName: "EduSpark",
    location: "Singapore",
    continent: "Asia",
    region: "Southeast Asia",
    revenue_range: "$1M-$5M",
    employee_range: "10-25",
    total_funding_amount_usd: 3000000,
    last_funding_date: "2024-04",
    funding_types: ["Seed"],
    industry: "Education Technology",
    description: "Personalized learning platform using AI to adapt curriculum to individual student needs.",
    brandInfo: {
      marketPosition: "Early Stage Innovator",
      targetAudience: "K-12 schools and parents seeking personalized education"
    }
  },
  {
    companyName: "CloudNest",
    location: "Seattle, WA",
    continent: "North America",
    region: "Washington",
    revenue_range: "$100M+",
    employee_range: "500+",
    total_funding_amount_usd: 150000000,
    last_funding_date: "2023-09",
    funding_types: ["Seed", "Series A", "Series B", "Series C", "Series D"],
    industry: "Cloud Computing",
    description: "Multi-cloud management and optimization platform for enterprise infrastructure.",
    brandInfo: {
      marketPosition: "Market Leader",
      targetAudience: "Enterprise IT teams managing multi-cloud environments"
    }
  },
  {
    companyName: "FoodieDelight",
    location: "Los Angeles, CA",
    continent: "North America",
    region: "California",
    revenue_range: "$5M-$10M",
    employee_range: "50-100",
    total_funding_amount_usd: 12000000,
    last_funding_date: "2024-05",
    funding_types: ["Seed", "Series A"],
    industry: "Food & Beverage",
    description: "Premium meal kit delivery service focused on chef-curated culinary experiences.",
    brandInfo: {
      marketPosition: "Premium Segment Leader",
      targetAudience: "Food enthusiasts and home chefs aged 30-55"
    }
  },
  {
    companyName: "SportSync",
    location: "Miami, FL",
    continent: "North America",
    region: "Florida",
    revenue_range: "$2M-$5M",
    employee_range: "15-30",
    total_funding_amount_usd: 6000000,
    last_funding_date: "2024-02",
    funding_types: ["Seed", "Angel"],
    industry: "Sports Technology",
    description: "Real-time sports analytics and fan engagement platform for professional teams.",
    brandInfo: {
      marketPosition: "Emerging Innovator",
      targetAudience: "Professional sports teams and avid sports fans"
    }
  },
  {
    companyName: "StyleVault",
    location: "Paris, France",
    continent: "Europe",
    region: "Western Europe",
    revenue_range: "$15M-$30M",
    employee_range: "75-150",
    total_funding_amount_usd: 35000000,
    last_funding_date: "2023-12",
    funding_types: ["Seed", "Series A", "Series B"],
    industry: "Fashion & Retail",
    description: "AI-powered personal styling and luxury fashion marketplace.",
    brandInfo: {
      marketPosition: "Premium Challenger",
      targetAudience: "Fashion-forward consumers seeking personalized luxury experiences"
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const companiesCollection = db.collection("companies");

    // Get optional clear parameter
    const { searchParams } = new URL(request.url);
    const clearExisting = searchParams.get('clear') === 'true';

    if (clearExisting) {
      await companiesCollection.deleteMany({});
    }

    // Add timestamps and UUID to each company
    const companiesWithMeta = sampleCompanies.map(company => ({
      ...company,
      uuid: `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert all companies
    const result = await companiesCollection.insertMany(companiesWithMeta);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.insertedCount} companies`,
      companies: sampleCompanies.map(c => c.companyName)
    });
  } catch (error) {
    console.error('Company seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed companies', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const companiesCollection = db.collection("companies");

    const companies = await companiesCollection.find({}).toArray();

    return NextResponse.json({
      success: true,
      count: companies.length,
      companies: companies.map(c => ({
        name: c.companyName,
        industry: c.industry,
        location: c.location,
        funding: c.total_funding_amount_usd
      }))
    });
  } catch (error) {
    console.error('Company fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

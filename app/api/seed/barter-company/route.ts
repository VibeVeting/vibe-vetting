import { NextResponse } from 'next/server';
import { BarterCompanyModel } from '@/lib/models/barter-company';

export async function POST() {
  try {
    // Demo company data
    const demoCompanies = [
      {
        email: 'demo@fashionbrand.com',
        password: 'demo123',
        userType: 'barter_company' as const,
        companyProfile: {
          companyName: 'Fashion Forward Inc.',
          industry: 'Fashion',
          website: 'https://fashionforward.com',
          description: 'Leading fashion brand specializing in sustainable clothing and accessories.',
          productsCategories: ['Clothing', 'Accessories', 'Sustainable Fashion'],
          monthlyBarterBudget: '50000-100000',
          logo: '',
          address: 'Mumbai, India',
          contactPerson: 'Priya Sharma',
          contactPhone: '+91 98765 43210'
        }
      },
      {
        email: 'demo@techgadgets.com',
        password: 'demo123',
        userType: 'barter_company' as const,
        companyProfile: {
          companyName: 'Tech Gadgets Pro',
          industry: 'Technology',
          website: 'https://techgadgetspro.com',
          description: 'Premium tech accessories and gadgets for modern lifestyle.',
          productsCategories: ['Electronics', 'Tech Accessories', 'Smart Home'],
          monthlyBarterBudget: '100000+',
          logo: '',
          address: 'Bangalore, India',
          contactPerson: 'Rahul Verma',
          contactPhone: '+91 98765 43211'
        }
      },
      {
        email: 'demo@beautybrand.com',
        password: 'demo123',
        userType: 'barter_company' as const,
        companyProfile: {
          companyName: 'Glow Beauty Co.',
          industry: 'Beauty',
          website: 'https://glowbeauty.com',
          description: 'Natural and organic beauty products for conscious consumers.',
          productsCategories: ['Skincare', 'Makeup', 'Haircare', 'Organic Beauty'],
          monthlyBarterBudget: '25000-50000',
          logo: '',
          address: 'Delhi, India',
          contactPerson: 'Sneha Patel',
          contactPhone: '+91 98765 43212'
        }
      }
    ];

    const results = [];

    for (const company of demoCompanies) {
      // Check if company already exists
      const existingCompany = await BarterCompanyModel.findByEmail(company.email);
      
      if (existingCompany) {
        results.push({ email: company.email, status: 'already_exists' });
        continue;
      }

      // Create new company
      const newCompany = await BarterCompanyModel.create(company);
      results.push({ 
        email: company.email, 
        status: 'created',
        id: newCompany._id 
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo barter companies seeded',
      results,
      loginCredentials: {
        note: 'Use these credentials to login at /login-barter-company',
        accounts: [
          { email: 'demo@fashionbrand.com', password: 'demo123' },
          { email: 'demo@techgadgets.com', password: 'demo123' },
          { email: 'demo@beautybrand.com', password: 'demo123' }
        ]
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed barter companies' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to seed demo barter company accounts',
    endpoint: '/api/seed/barter-company',
    method: 'POST'
  });
}

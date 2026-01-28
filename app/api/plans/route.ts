import { NextResponse } from 'next/server';
import { getPlans, seedPlans } from '@/lib/models/plans';

export async function GET() {
  try {
    // First, ensure plans are seeded
    await seedPlans();
    
    // Get all active plans (sorted by order)
    const plans = await getPlans();
    
    return NextResponse.json({
      success: true,
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price: plan.price,
        priceUSD: plan.priceUSD,
        period: plan.period,
        features: plan.features,
        popular: plan.popular,
        order: plan.order,
      })),
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

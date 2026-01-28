import { NextResponse } from 'next/server';
import { seedPlans } from '@/lib/models/plans';

export async function POST() {
  try {
    await seedPlans();
    
    return NextResponse.json({
      success: true,
      message: 'Plans seeded successfully',
    });
  } catch (error) {
    console.error('Error seeding plans:', error);
    return NextResponse.json(
      { error: 'Failed to seed plans' },
      { status: 500 }
    );
  }
}

// Allow GET for easy testing
export async function GET() {
  return POST();
}

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface Plan {
  _id?: ObjectId;
  id: string;
  name: string;
  price: number; // Price in INR (paise for Razorpay)
  priceUSD: number; // Original USD price
  period: 'month' | 'year' | 'custom';
  features: string[];
  popular?: boolean;
  order: number; // Display order
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoBooking {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
  companySize?: string;
  jobTitle?: string;
  interests: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  googleCalendarLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DB_NAME = 'vibe-vetting';

// Plans Collection
export async function getPlans(): Promise<Plan[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const plans = await db.collection<Plan>('plans').find({ active: true }).sort({ order: 1 }).toArray();
  return plans;
}

export async function getPlanById(planId: string): Promise<Plan | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<Plan>('plans').findOne({ id: planId, active: true });
}

export async function seedPlans(): Promise<void> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  const USD_TO_INR = 83.5;
  
  // Beta pricing with 50% discount applied
  // Starter: $120 regular → $60 beta
  // Growth: $360 regular → $180 beta
  // Enterprise: Custom
  // Note: 18% GST applicable for Indian customers
  
  const defaultPlans: Omit<Plan, '_id'>[] = [
    {
      id: 'starter',
      name: 'Starter',
      priceUSD: 60, // Beta price (50% off $120)
      price: 4999, // ₹4,999
      period: 'month',
      features: [
        '50 vibeAI™ Analyses/month',
        'AI Fake Follower Detection',
        '3 Year History Analysis',
        'Email & Chat Support',
        'Up to 3 team members'
      ],
      popular: false,
      order: 1,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'growth',
      name: 'Growth',
      priceUSD: 180, // Beta price (50% off $360)
      price: 14999, // ₹14,999
      period: 'month',
      features: [
        '250 vibeAI™ Analyses/month',
        'Advanced Brand Safety AI',
        'Complete History Analysis',
        'Priority Support + CSM',
        'Custom Brand DNA Profile',
        'Auto-negotiation AI',
        'Up to 10 team members'
      ],
      popular: true,
      order: 2,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      priceUSD: 0,
      price: 0,
      period: 'custom',
      features: [
        'Unlimited vibeAI™ Analyses',
        'White-label Solution',
        'Dedicated AI Engineer',
        'Custom AI Model Training',
        'SLA Guarantee (99.9%)',
        'API Access & Integrations',
        'Unlimited team members'
      ],
      popular: false,
      order: 3,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  // Upsert plans
  for (const plan of defaultPlans) {
    await db.collection<Plan>('plans').updateOne(
      { id: plan.id },
      { $set: plan },
      { upsert: true }
    );
  }
}

// Demo Bookings Collection
export async function createDemoBooking(booking: Omit<DemoBooking, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<DemoBooking> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  const newBooking: Omit<DemoBooking, '_id'> = {
    ...booking,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const result = await db.collection<DemoBooking>('demo_bookings').insertOne(newBooking as DemoBooking);
  return { ...newBooking, _id: result.insertedId };
}

export async function getDemoBookings(adminEmail?: string): Promise<DemoBooking[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<DemoBooking>('demo_bookings').find({}).sort({ createdAt: -1 }).toArray();
}

export async function getDemoBookingById(id: string): Promise<DemoBooking | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<DemoBooking>('demo_bookings').findOne({ _id: new ObjectId(id) });
}

export async function updateDemoBookingStatus(id: string, status: DemoBooking['status']): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<DemoBooking>('demo_bookings').updateOne(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

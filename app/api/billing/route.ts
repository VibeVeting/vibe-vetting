import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET - Fetch user's billing history
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'User ID required' 
      }, { status: 401 });
    }

    const db = await getDb();
    const invoices = await db.collection('invoices')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      invoices: invoices.map(inv => ({
        id: inv._id.toString(),
        invoiceNumber: inv.invoiceNumber,
        date: inv.createdAt,
        planName: inv.planName,
        amount: inv.amount,
        status: inv.status,
        paymentId: inv.paymentId,
      })),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch billing history' 
    }, { status: 500 });
  }
}

// POST - Create new invoice after payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, userName, planId, planName, amount, paymentId, orderId, signature } = body;

    if (!userId || !planId || !amount || !paymentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const db = await getDb();

    // Generate invoice number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await db.collection('invoices').countDocuments() + 1;
    const invoiceNumber = `VV-${year}${month}-${String(count).padStart(5, '0')}`;

    // Create invoice record
    const invoice = {
      invoiceNumber,
      userId,
      userEmail: userEmail || '',
      userName: userName || '',
      planId,
      planName,
      amount,
      gstAmount: Math.round(amount * 0.18),
      totalAmount: Math.round(amount * 1.18),
      paymentId,
      orderId: orderId || null,
      signature: signature || null,
      status: 'paid',
      paymentMethod: 'Razorpay',
      createdAt: new Date(),
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    };

    const result = await db.collection('invoices').insertOne(invoice);

    // Update user's plan
    await db.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          currentPlan: planId,
          planUpdatedAt: new Date(),
        },
        $push: {
          paymentHistory: {
            invoiceId: result.insertedId.toString(),
            invoiceNumber,
            amount,
            paymentId,
            date: new Date(),
          } as any,
        },
      }
    );

    return NextResponse.json({
      success: true,
      invoice: {
        id: result.insertedId.toString(),
        ...invoice,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create invoice' 
    }, { status: 500 });
  }
}

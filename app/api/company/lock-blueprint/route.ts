import { NextRequest, NextResponse } from 'next/server';
import { CompanyModel } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

// POST - Toggle blueprint lock status
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, locked } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (typeof locked !== 'boolean') {
      return NextResponse.json(
        { error: 'Locked status (boolean) is required' },
        { status: 400 }
      );
    }

    // Get user email/name for tracking who locked
    const lockedBy = decoded.email || decoded.userId || 'Unknown';

    const company = await CompanyModel.toggleBlueprintLock(companyName, locked, lockedBy);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: locked ? 'Blueprint locked successfully' : 'Blueprint unlocked successfully',
      company: {
        companyName: company.companyName,
        blueprintLocked: company.blueprintLocked,
        blueprintLockedAt: company.blueprintLockedAt,
        blueprintLockedBy: company.blueprintLockedBy,
      }
    });
  } catch (error) {
    console.error('Error toggling blueprint lock:', error);
    return NextResponse.json(
      { error: 'Failed to toggle blueprint lock' },
      { status: 500 }
    );
  }
}

// GET - Get current blueprint lock status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get('companyName');

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const company = await CompanyModel.findByName(companyName);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      companyName: company.companyName,
      blueprintLocked: company.blueprintLocked || false,
      blueprintLockedAt: company.blueprintLockedAt || null,
      blueprintLockedBy: company.blueprintLockedBy || null,
    });
  } catch (error) {
    console.error('Error getting blueprint lock status:', error);
    return NextResponse.json(
      { error: 'Failed to get blueprint lock status' },
      { status: 500 }
    );
  }
}

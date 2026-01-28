import { NextRequest, NextResponse } from 'next/server';
import { getDemoBookings, updateDemoBookingStatus } from '@/lib/models/plans';

// GET all demo bookings (for admin)
export async function GET() {
  try {
    const bookings = await getDemoBookings();
    
    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking._id?.toString(),
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        phone: booking.phone,
        company: booking.company,
        companySize: booking.companySize,
        jobTitle: booking.jobTitle,
        interests: booking.interests,
        preferredDate: booking.preferredDate,
        preferredTime: booking.preferredTime,
        timezone: booking.timezone,
        message: booking.message,
        status: booking.status,
        googleCalendarLink: booking.googleCalendarLink,
        createdAt: booking.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching demo bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo bookings' },
      { status: 500 }
    );
  }
}

// PATCH to update booking status
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      );
    }
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const updated = await updateDemoBookingStatus(id, status);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Booking status updated',
    });
  } catch (error) {
    console.error('Error updating demo booking:', error);
    return NextResponse.json(
      { error: 'Failed to update demo booking' },
      { status: 500 }
    );
  }
}

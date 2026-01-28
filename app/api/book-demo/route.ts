import { NextRequest, NextResponse } from 'next/server';
import { createDemoBooking } from '@/lib/models/plans';

// Your email where all demo bookings will be sent
const ADMIN_EMAIL = 'vinay91098@gmail.com';

// Convert 12-hour time to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = modifier === 'AM' ? '00' : '12';
  } else if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  
  return `${hours.padStart(2, '0')}:${minutes}`;
}

// Generate Google Calendar URL
function generateGoogleCalendarLink(booking: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  companySize: string;
  jobTitle: string;
  interests: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
}): string {
  const time24 = convertTo24Hour(booking.preferredTime);
  const [hours, minutes] = time24.split(':');
  
  const startDate = new Date(booking.preferredDate);
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30); // 30-minute demo
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
  const formatForGoogle = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const title = encodeURIComponent(`VibeVetting Demo - ${booking.company}`);
  const details = encodeURIComponent(
    `Demo with ${booking.firstName} ${booking.lastName}\n\n` +
    `Company: ${booking.company}\n` +
    `Email: ${booking.email}\n` +
    `Phone: ${booking.phone || 'Not provided'}\n` +
    `Job Title: ${booking.jobTitle || 'Not specified'}\n\n` +
    `Interests: ${booking.interests.join(', ')}\n\n` +
    `Message: ${booking.message || 'None'}`
  );
  const location = encodeURIComponent('Google Meet (link will be added)');
  const dates = `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`;
  
  // Add both admin and attendee
  const guests = encodeURIComponent(`${booking.email},${ADMIN_EMAIL}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}&add=${guests}&sf=true&output=xml`;
}

// Generate ICS calendar file content
function generateICSContent(booking: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  companySize: string;
  jobTitle: string;
  interests: string[];
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
}): string {
  const time24 = convertTo24Hour(booking.preferredTime);
  const [hours, minutes] = time24.split(':');
  
  const startDate = new Date(booking.preferredDate);
  startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 30); // 30-minute demo
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const uid = `demo-${Date.now()}@vibevetting.com`;
  const now = formatDate(new Date());
  
  const description = `VibeVetting Demo with ${booking.firstName} ${booking.lastName}\\n\\n` +
    `Company: ${booking.company}\\n` +
    `Company Size: ${booking.companySize || 'Not specified'}\\n` +
    `Job Title: ${booking.jobTitle || 'Not specified'}\\n` +
    `Email: ${booking.email}\\n` +
    `Phone: ${booking.phone || 'Not provided'}\\n\\n` +
    `Interests: ${booking.interests.join(', ')}\\n\\n` +
    `Message: ${booking.message || 'No additional message'}`;
  
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//VibeVetting//Demo Booking//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:VibeVetting Demo - ${booking.company}
DESCRIPTION:${description}
LOCATION:Google Meet (link will be sent separately)
ORGANIZER;CN=VibeVetting:mailto:${ADMIN_EMAIL}
ATTENDEE;CN=${booking.firstName} ${booking.lastName};RSVP=TRUE:mailto:${booking.email}
ATTENDEE;CN=Vinay (VibeVetting);RSVP=TRUE:mailto:${ADMIN_EMAIL}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Demo with ${booking.company} in 30 minutes
END:VALARM
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:Demo with ${booking.company} in 10 minutes
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();
    
    // Validate required fields
    if (!booking.firstName || !booking.lastName || !booking.email || !booking.preferredDate || !booking.preferredTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate ICS content for download
    const icsContent = generateICSContent(booking);
    
    // Generate Google Calendar link
    const googleCalendarLink = generateGoogleCalendarLink(booking);
    
    // Save to database
    const savedBooking = await createDemoBooking({
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
      googleCalendarLink,
    });
    
    // Format the date for display
    const formattedDate = new Date(booking.preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Log the booking details for server-side tracking
    console.log('=== NEW DEMO BOOKING ===');
    console.log(`Booking ID: ${savedBooking._id}`);
    console.log(`Date: ${formattedDate}`);
    console.log(`Time: ${booking.preferredTime}`);
    console.log(`Name: ${booking.firstName} ${booking.lastName}`);
    console.log(`Email: ${booking.email}`);
    console.log(`Phone: ${booking.phone || 'Not provided'}`);
    console.log(`Company: ${booking.company}`);
    console.log(`Company Size: ${booking.companySize || 'Not specified'}`);
    console.log(`Job Title: ${booking.jobTitle || 'Not specified'}`);
    console.log(`Interests: ${booking.interests.join(', ')}`);
    console.log(`Message: ${booking.message || 'None'}`);
    console.log('========================');
    
    // Return success with calendar links
    return NextResponse.json({
      success: true,
      message: 'Demo booked successfully!',
      booking: {
        date: formattedDate,
        time: booking.preferredTime,
        attendee: `${booking.firstName} ${booking.lastName}`,
        email: booking.email,
        company: booking.company,
      },
      calendar: {
        googleCalendarLink,
        icsContent: Buffer.from(icsContent).toString('base64'),
      }
    });
    
  } catch (error) {
    console.error('Error booking demo:', error);
    return NextResponse.json(
      { error: 'Failed to book demo. Please try again.' },
      { status: 500 }
    );
  }
}

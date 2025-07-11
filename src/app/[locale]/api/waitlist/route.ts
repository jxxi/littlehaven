import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logError } from '@/utils/Logger';
import {
  checkExistingEmail,
  createWaitlistSignup,
} from '@/utils/waitlist/operations';

export async function POST(request: NextRequest) {
  try {
    const { name, email, location } = await request.json();

    if (!name || !email || !location) {
      return NextResponse.json(
        { error: 'Name, email, and location are required.' },
        { status: 400 },
      );
    }

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const { data: existing, error: checkError } =
      await checkExistingEmail(email);
    if (checkError) {
      logError('Error checking existing email', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist.' },
        { status: 409 },
      );
    }

    const { error: insertError } = await createWaitlistSignup({
      name,
      email,
      location,
    });
    if (insertError) {
      logError('Error inserting waitlist signup', insertError);
      return NextResponse.json(
        { error: 'Failed to add to waitlist.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Waitlist error', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 },
    );
  }
}

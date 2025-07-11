import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { waitlistSchema } from '@/models/Schema';
import { logError } from '@/utils/Logger';

export interface WaitlistSignup {
  name: string;
  email: string;
  location: string;
}

export async function checkExistingEmail(email: string) {
  try {
    const existing = await db.query.waitlistSchema.findFirst({
      where: eq(waitlistSchema.email, email),
      columns: { id: true },
    });

    return { data: existing, error: null };
  } catch (error) {
    logError('Error in checkExistingEmail', error);
    return { data: null, error };
  }
}

export async function createWaitlistSignup(signup: WaitlistSignup) {
  try {
    const result = await db.insert(waitlistSchema).values(signup).returning();
    return { error: null, data: result[0] };
  } catch (error) {
    logError('Error in createWaitlistSignup', error);
    return { error, data: null };
  }
}

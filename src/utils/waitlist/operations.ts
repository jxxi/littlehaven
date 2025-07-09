import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { signupsSchema } from '@/models/Schema';

export interface WaitlistSignup {
  name: string;
  email: string;
  location: string;
}

export async function checkExistingEmail(email: string) {
  try {
    const existing = await db.query.signupsSchema.findFirst({
      where: eq(signupsSchema.email, email),
      columns: { id: true },
    });

    return { data: existing, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createWaitlistSignup(signup: WaitlistSignup) {
  try {
    const result = await db.insert(signupsSchema).values(signup).returning();
    return { error: null, data: result[0] };
  } catch (error) {
    return { error, data: null };
  }
}

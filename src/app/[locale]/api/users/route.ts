import { NextResponse } from 'next/server';

import { getUserList } from '@/utils/clerk/operations';
import { logError } from '@/utils/Logger';

export async function GET() {
  try {
    const users = await getUserList();
    return NextResponse.json(users);
  } catch (error) {
    logError('Error in users API route', error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}

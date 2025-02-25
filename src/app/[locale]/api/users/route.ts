import { NextResponse } from 'next/server';

import { getUserList } from '@/utils/clerk/operations';

export async function GET() {
  try {
    const users = await getUserList();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}

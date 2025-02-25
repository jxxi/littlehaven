import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getUserCircles } from '@/utils/clerk/operations';
import { updateUserInterests } from '@/utils/clerk/private/operations';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const userId = searchParams.get('userId') as string;

    const circles = await getUserCircles(userId);
    return NextResponse.json(circles, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch circles for user' },
      { status: 500 },
    ); // Handle errors with a status code
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, interests } = await req.json();

    if (!userId || !interests) {
      return NextResponse.json(
        { error: 'userId and interests are required' },
        { status: 400 },
      );
    }

    await updateUserInterests(userId, interests);
    return NextResponse.json(
      { message: 'User interests metadata updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user interests metadata' },
      { status: 500 },
    );
  }
}

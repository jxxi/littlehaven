import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getUserCircles, updateUserMetadata } from '@/utils/clerk/route';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const userId = searchParams.get('id') as string;

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
    const { id, circles } = await req.json();

    if (!id || !circles) {
      return NextResponse.json(
        { error: 'id and circles are required' },
        { status: 400 },
      );
    }

    await updateUserMetadata(id, circles);
    return NextResponse.json(
      { message: 'User metadata updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user metadata' },
      { status: 500 },
    );
  }
}

import { type NextRequest, NextResponse } from 'next/server';

import {
  getUnreadStatus,
  updateCircleLastRead,
} from '@/utils/circle/member/operations';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const circleId = searchParams.get('circleId') as string;

  if (circleId) {
    try {
      const circle = await getUnreadStatus(circleId as string);
      return NextResponse.json(circle, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch circle read status' },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { error: 'Invalid query parameters' },
      { status: 400 },
    );
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const circleId = searchParams.get('circleId') as string;
  const userId = searchParams.get('userId') as string;
  try {
    const response = await updateCircleLastRead(circleId, userId);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update circle to read' },
      { status: 500 },
    );
  }
}

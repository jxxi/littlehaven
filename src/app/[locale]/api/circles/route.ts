import { type NextRequest, NextResponse } from 'next/server';

import {
  createCircle,
  deleteCircle,
  getCircle,
  getCirclesWithMemberByUserId,
  getPublicCircles,
  updateCircle,
} from '@/utils/circle/operations';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const userId = searchParams.get('userId') as string;
  const circleId = searchParams.get('circleId') as string;
  const isPublic = searchParams.get('isPublic') as string;

  if (circleId) {
    // Get a specific circle
    try {
      const circle = await getCircle(circleId as string);
      return NextResponse.json(circle, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch circle' },
        { status: 500 },
      );
    }
  } else if (userId) {
    // Get circles by user ID
    try {
      const circles = await getCirclesWithMemberByUserId(userId as string);
      return NextResponse.json(circles, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch circles for user' },
        { status: 500 },
      );
    }
  } else if (isPublic) {
    // Get public circles
    try {
      const publicCircles = await getPublicCircles();
      return NextResponse.json(publicCircles, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch public circles for user' },
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
  // Create a new circle
  const circle = await req.json();
  try {
    const newCircle = await createCircle(circle);
    return NextResponse.json(newCircle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create circle' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  // Update an existing circle
  const { circleId, updates } = await req.json();
  try {
    const updatedCircle = await updateCircle(circleId, updates);
    return NextResponse.json(updatedCircle, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update circle' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Delete a circle
  const { circleId } = await req.json();
  try {
    const deletedCircle = await deleteCircle(circleId);
    return NextResponse.json(deletedCircle, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete circle' },
      { status: 500 },
    );
  }
}

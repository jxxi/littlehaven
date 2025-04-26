import { NextResponse } from 'next/server';

import {
  createCircleMember,
  deleteCircleMember,
  getAllMembersForCircle,
  getMemberByCircleIdAndUserId,
  updateCircleMember,
} from '@/utils/circle/member/operations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId, bio, nickname } = body;

    const newMemberRole = await createCircleMember({
      circleId,
      userId,
      nickname,
      bio,
    });

    return NextResponse.json(newMemberRole, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId, updates } = body;

    const updatedMemberRole = await updateCircleMember(
      circleId,
      userId,
      updates,
    );

    return NextResponse.json(updatedMemberRole);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId } = body;

    const deletedMemberRole = await deleteCircleMember(circleId, userId);

    return NextResponse.json(deletedMemberRole);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // In App Router, query params would come from the URL rather than body
    const { searchParams } = new URL(request.url);
    const circleId = searchParams.get('circleId');
    const userId = searchParams.get('userId');

    let roles;

    if (circleId && userId) {
      roles = await getMemberByCircleIdAndUserId(circleId, userId);
    } else if (circleId) {
      roles = await getAllMembersForCircle(circleId);
    } else {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 },
      );
    }

    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

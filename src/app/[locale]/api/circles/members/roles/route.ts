import { NextResponse } from 'next/server';

import {
  createMemberRole,
  deleteMemberRole,
  getRolesForUserInCircle,
  updateMemberRole,
} from '@/utils/circle/member/operations'; // Adjust the import based on your project structure

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId, roleId } = body;
    const newMemberRole = await createMemberRole(circleId, userId, roleId);
    return NextResponse.json(newMemberRole, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId, updates } = body;
    const updatedMemberRole = await updateMemberRole(circleId, userId, updates);
    return NextResponse.json(updatedMemberRole);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { circleId, userId } = body;
    const deletedMemberRole = await deleteMemberRole(circleId, userId);
    return NextResponse.json(deletedMemberRole);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const circleId = searchParams.get('circleId');
    const userId = searchParams.get('userId');

    if (!circleId || !userId) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 },
      );
    }

    const roles = await getRolesForUserInCircle(circleId, userId);
    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

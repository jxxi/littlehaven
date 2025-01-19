import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  deleteCircleMember,
  getCircleMember,
  getCircleMembers,
  updateCircleMember,
} from '@/utils/circle/member/route';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const userId = searchParams.get('id') as string;
    const circleId = searchParams.get('circleId') as string;

    if (circleId && userId) {
      const circleMemhber = await getCircleMember(circleId, userId);
      return NextResponse.json(circleMemhber, { status: 200 });
    }

    if (circleId) {
      const circleMembers = await getCircleMembers(circleId);
      return NextResponse.json(circleMembers, { status: 200 });
    }

    return NextResponse.json({ error: 'circleId required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch circle member(s)' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const memberData = await req.json();
    const id = memberData.get('id') as string;
    const circleId = memberData.get('circleId') as string;

    if (!id || !circleId) {
      return NextResponse.json(
        { error: 'id and circleId are required' },
        { status: 400 },
      );
    }

    await updateCircleMember(circleId, id, memberData);
    return NextResponse.json(
      { message: 'Circle member updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update circle member' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const { searchParams } = url;
    const userId = searchParams.get('id') as string;
    const circleId = searchParams.get('circleId') as string;

    if (circleId && userId) {
      const circleMember = await deleteCircleMember(circleId, userId);
      return NextResponse.json(circleMember, { status: 200 });
    }

    return NextResponse.json(
      { error: 'circleId and userId required' },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete circles member' },
      { status: 500 },
    );
  }
}

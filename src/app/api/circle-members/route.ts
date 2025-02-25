import { NextResponse } from 'next/server';

import type { CircleMember } from '@/types/CircleMember';
import { createCircleMembers } from '@/utils/circle/member/operations';

export async function POST(request: Request) {
  try {
    const members: CircleMember[] = await request.json();

    if (!members || !Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const result = await createCircleMembers(members);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating circle members:', error);
    return NextResponse.json(
      { error: 'Failed to create circle members' },
      { status: 500 },
    );
  }
}

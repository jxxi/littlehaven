import { clerkClient } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateUserMetadata(request: NextRequest) {
  const { userId, circles } = await request.json();

  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      circles,
    },
  });

  // after success update session claims
  return NextResponse.json({ success: true });
}

export async function getUserMetadata(request: NextRequest) {
  const { userId } = await request.json();

  const client = await clerkClient();

  const user = await client.users.getUser(userId);

  return NextResponse.json(user.publicMetadata);
}

type UserMetadata = {
  circles: '';
};
export async function getUserCircles(request: NextRequest) {
  const { userId } = await request.json();

  const client = await clerkClient();

  const user = await client.users.getUser(userId);

  return NextResponse.json(user.publicMetadata as UserMetadata);
}

import { clerkClient } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateUserMetadata(request: NextRequest) {
  const { userId, bios } = await request.json();

  const client = await clerkClient();

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      bios,
    },
  });

  // after success update session claims
  return NextResponse.json({ success: true });
}

export async function getUserMetadata(request: NextRequest) {
  const { userId } = await request.json();

  const client = await clerkClient();

  const user = await client.users.getUser(userId);

  return NextResponse.json(user.privateMetadata);
}

type UserMetadata = {
  bios: '';
};
export async function getUserBios(request: NextRequest) {
  const { userId } = await request.json();

  const client = await clerkClient();

  const user = await client.users.getUser(userId);

  return NextResponse.json(user.privateMetadata as UserMetadata);
}

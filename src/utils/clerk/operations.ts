import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { logError } from '@/utils/Logger';

export async function updateUserMetadata(id: string, circles: string[]) {
  const client = await clerkClient();

  await client.users.updateUserMetadata(id, {
    publicMetadata: {
      circles,
    },
  });

  // after success update session claims
  return NextResponse.json({ success: true });
}

// TODO: only get fields needed from clerk
export async function getUserInfoFromIds(ids: string[]) {
  const client = await clerkClient();
  try {
    const { data } = await client.users.getUserList({
      userId: ids,
      orderBy: 'username',
    });
    return data.map((user) => ({
      id: user.id,
      username: user.username,
      imageUrl: user.imageUrl,
    }));
  } catch (error) {
    logError('Error in getUserInfoFromIds', error);
    throw new Error('Failed to fetch user info');
  }
}

export async function getUserList() {
  const client = await clerkClient();

  const response = await client.users.getUserList();

  return NextResponse.json(response);
}

export async function getUserMetadata(id: string) {
  const client = await clerkClient();

  const user = await client.users.getUser(id);

  return NextResponse.json(user.publicMetadata);
}

export async function banUser(id: string) {
  const client = await clerkClient();

  const response = await client.users.banUser(id);

  return NextResponse.json(response);
}

export async function unbanUser(id: string) {
  const client = await clerkClient();

  const response = await client.users.unbanUser(id);

  return NextResponse.json(response);
}

type UserMetadata = {
  circles: [];
};
export async function getUserCircles(id: string) {
  const client = await clerkClient();

  const user = await client.users.getUser(id);
  const circles = user.publicMetadata as UserMetadata;

  return circles;
}

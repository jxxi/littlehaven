import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

export async function getUserInfoFromIds(ids: [string]) {
  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserList({
      userId: ids,
      orderBy: 'username',
    });

    const userInfo = data.map((user) => ({
      id: user.id,
      username: user.username,
      imageUrl: user.imageUrl,
    }));

    return NextResponse.json(userInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 },
    );
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

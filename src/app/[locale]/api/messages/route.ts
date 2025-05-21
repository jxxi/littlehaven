import { clerkClient } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';

import {
  createMessage,
  generateThumbnail,
  getAllMessagesWithReactionsForChannel,
  updateMessage,
} from '@/utils/message/operations';

const createMediaMessage = async (
  circleId: string,
  channelId: string,
  userId: string,
  content: string,
  data: FormData,
) => {
  const file = data.get('file') as File;
  const type = data.get('type') as string;

  if (!file || !type) {
    return NextResponse.json(
      { error: 'Missing file or type' },
      { status: 400 },
    );
  }
  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `${nanoid()}.${ext}`;
  const pathname = `uploads/${type}s/${filename}`;

  // Upload to blob storage
  const blob = await put(pathname, file, {
    access: 'public',
  });

  // For videos, generate thumbnail
  let poster;
  if (type === 'video') {
    poster = await generateThumbnail(blob.url);
  }
  const dbMessage = await createMessage(
    circleId,
    channelId,
    userId,
    content,
    pathname,
    type,
    poster,
  );
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  // After creating the message in DB
  const createdMessage = {
    ...dbMessage,
    user: {
      username: user.username,
      imageUrl: user.imageUrl,
    },
  };
  return NextResponse.json(createdMessage);
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const circleId = searchParams.get('circleId');
  const channelId = searchParams.get('channelId');
  const before = searchParams.get('before');
  const after = searchParams.get('after');
  const limit = searchParams.get('limit')
    ? parseInt(searchParams.get('limit')!, 10)
    : 50;

  if (!circleId || !channelId) {
    return NextResponse.json(
      { error: 'Both Circle and Channel Id are required' },
      { status: 400 },
    );
  }

  try {
    let messagesWithReactions;
    if (after) {
      messagesWithReactions = await getAllMessagesWithReactionsForChannel(
        channelId,
        { after: after || undefined, limit },
      );
    } else {
      messagesWithReactions = await getAllMessagesWithReactionsForChannel(
        channelId,
        { before: before || undefined, limit },
      );
    }
    return NextResponse.json(messagesWithReactions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { circleId, channelId, userId, content } = body;

    if (!circleId || !userId || !channelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    let message;
    const contentType = request.headers.get('content-type');
    const isMediaUpload = contentType?.includes('multipart/form-data');
    if (isMediaUpload) {
      const formData = await request.formData();
      message = createMediaMessage(
        circleId,
        channelId,
        userId,
        content,
        formData,
      );
    } else {
      message = await createMessage(circleId, channelId, userId, content);
    }

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  function NoUpdates(content: any, isPinned: any): boolean {
    return !content && !isPinned;
  }

  try {
    const body = await request.json();
    const { messageId, content, isPinned } = body;

    if (!messageId || NoUpdates(content, isPinned)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }
    const contentType = request.headers.get('content-type');
    const isMediaUpload = contentType?.includes('multipart/form-data');
    if (isMediaUpload) {
      return NextResponse.json(
        { error: 'Failed to edit message' },
        { status: 500 },
      );
    }
    const updates = { content, isPinned, editedAt: new Date() };
    const message = await updateMessage(messageId, updates);

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to edit message' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, userId } = await request.json();
    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'Missing messageId or userId' },
        { status: 400 },
      );
    }
    // Fetch the message to check ownership
    const message = await import('@/utils/message/operations').then((m) =>
      m.getMessageById(messageId),
    );
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    if (message.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await import('@/utils/message/operations').then((m) =>
      m.deleteMessage(messageId),
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 },
    );
  }
}

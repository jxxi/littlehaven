/* eslint-disable no-console */
import { type NextRequest, NextResponse } from 'next/server';

import { logError } from '@/utils/Logger';
import {
  createMessage,
  getAllMessagesWithReactionsForChannel,
  updateMessage,
} from '@/utils/message/operations';

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

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
    console.log('Fetching messages for:', {
      circleId,
      channelId,
      before,
      after,
      limit,
    });

    let messagesWithReactions;
    if (after) {
      console.log('Using after parameter:', after);
      messagesWithReactions = await getAllMessagesWithReactionsForChannel(
        channelId,
        { after: after || undefined, limit },
      );
    } else {
      console.log('Using before parameter:', before);
      messagesWithReactions = await getAllMessagesWithReactionsForChannel(
        channelId,
        { before: before || undefined, limit },
      );
    }

    console.log(
      'Successfully fetched messages:',
      messagesWithReactions?.length || 0,
    );
    return NextResponse.json(messagesWithReactions);
  } catch (error) {
    console.error('Detailed error in messages API route:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      circleId,
      channelId,
      before,
      after,
      limit,
    });
    logError('Error in messages API route', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      circleId,
      channelId,
      userId,
      content,
      encryptedContent,
      encryptionKeyId,
      encryptionIv,
      isEncrypted,
    } = body;

    if (!circleId || !userId || !channelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const message = await createMessage(
      circleId,
      channelId,
      userId,
      content,
      undefined, // mediaUrl
      undefined, // mediaType
      undefined, // thumbnailUrl
      undefined, // isTts
      undefined, // replyToMessageId
      encryptedContent,
      encryptionKeyId,
      encryptionIv,
      isEncrypted,
    );

    return NextResponse.json(message);
  } catch (error) {
    logError('Error in messages API route', error);
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
    const updates = { content, isPinned, editedAt: new Date() };
    const message = await updateMessage(messageId, updates);

    return NextResponse.json(message);
  } catch (error) {
    logError('Error in messages API route', error);
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
    logError('Error in messages API route', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 },
    );
  }
}

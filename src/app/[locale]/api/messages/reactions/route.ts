import { NextResponse } from 'next/server';

import {
  createReaction,
  deleteReaction,
  getAllReactionsForMessage,
} from '@/utils/message/operations';

export async function POST(request: Request) {
  try {
    const { messageId, userId, emoji } = await request.json();
    if (!messageId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'Missing messageId, userId, or emoji' },
        { status: 400 },
      );
    }
    await createReaction(messageId, userId, emoji);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { messageId, userId, emoji } = await request.json();
    if (!messageId || !userId || !emoji) {
      return NextResponse.json(
        { error: 'Missing messageId, userId, or emoji' },
        { status: 400 },
      );
    }
    await deleteReaction(messageId, userId, emoji);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');
    if (!messageId) {
      return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
    }
    const reactions = await getAllReactionsForMessage(messageId);
    // Group by emoji, collect userIds
    const grouped = reactions.reduce(
      (acc, r) => {
        if (!r.emoji) return acc;
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r.userId);
        return acc;
      },
      {} as Record<string, string[]>,
    );
    const result = Object.entries(grouped).map(([emoji, userIds]) => ({
      emoji,
      userIds,
    }));
    return NextResponse.json({ reactions: result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 },
    );
  }
}

export async function POSTBATCH(request: Request) {
  try {
    const { messageIds } = await request.json();
    if (!messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Missing or invalid messageIds' },
        { status: 400 },
      );
    }
    const reactions = await Promise.all(
      messageIds.map((id) => getAllReactionsForMessage(id)),
    );
    const grouped = reactions.reduce(
      (acc, r) => {
        if (!r || !r.length) return acc;
        r.forEach((reaction) => {
          if (!reaction.emoji) return;
          if (!acc[reaction.messageId]) acc[reaction.messageId] = [];
          acc[reaction.messageId].push({
            emoji: reaction.emoji,
            userIds: [reaction.userId],
          });
        });
        return acc;
      },
      {} as Record<string, { emoji: string; userIds: string[] }[]>,
    );
    return NextResponse.json(grouped);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 },
    );
  }
}

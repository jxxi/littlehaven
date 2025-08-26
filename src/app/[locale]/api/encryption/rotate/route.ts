import { auth } from '@clerk/nextjs/server';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logger } from '@/libs/Logger';
import { logError } from '@/utils/Logger';
import { getAllMessagesWithReactionsForChannel } from '@/utils/message/operations';

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const KEY_PREFIX = 'encryption_key:';
const KEY_TTL = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channelId, newKeyData } = body;

    if (!channelId || !newKeyData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Store the new key
    const keyId = `${KEY_PREFIX}${channelId}_${userId}`;
    await redis.setex(keyId, KEY_TTL, JSON.stringify(newKeyData));

    // Get all messages for the channel that need re-encryption
    const messages = await getAllMessagesWithReactionsForChannel(channelId);
    const encryptedMessages = messages.filter(
      (msg) => msg.isEncrypted && msg.encryptedContent,
    );

    // Note: In a real implementation, you would:
    // 1. Re-encrypt messages with the new key
    // 2. Update the database with new encrypted content
    // 3. Notify other users about the key rotation

    logger.info(
      `Key rotation completed for channel ${channelId}. ${encryptedMessages.length} messages need re-encryption.`,
    );

    return NextResponse.json({
      success: true,
      keyId: newKeyData.keyId,
      messagesToReEncrypt: encryptedMessages.length,
    });
  } catch (error) {
    logError('Error in key rotation API route', error);
    return NextResponse.json(
      { error: 'Failed to rotate encryption key' },
      { status: 500 },
    );
  }
}

// Get key rotation status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json(
        { error: 'Missing channelId parameter' },
        { status: 400 },
      );
    }

    // Get current key
    const keyId = `${KEY_PREFIX}${channelId}_${userId}`;
    const keyDataString = await redis.get<string>(keyId);

    if (!keyDataString) {
      return NextResponse.json({ error: 'No key found' }, { status: 404 });
    }

    const keyData = JSON.parse(keyDataString);
    const expiresAt = keyData.expiresAt ? new Date(keyData.expiresAt) : null;
    const now = new Date();

    // Calculate rotation status
    const daysUntilExpiry = expiresAt
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const needsRotation = expiresAt && now >= expiresAt;
    const inGracePeriod =
      expiresAt &&
      now >= expiresAt &&
      now <= new Date(expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    return NextResponse.json({
      keyId: keyData.keyId,
      createdAt: keyData.createdAt,
      expiresAt: keyData.expiresAt,
      daysUntilExpiry,
      needsRotation,
      inGracePeriod,
    });
  } catch (error) {
    logError('Error in key rotation status API route', error);
    return NextResponse.json(
      { error: 'Failed to get key rotation status' },
      { status: 500 },
    );
  }
}

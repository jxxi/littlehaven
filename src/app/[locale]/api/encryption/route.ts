import { auth } from '@clerk/nextjs/server';
import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { logError } from '@/utils/Logger';

// Force Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs';

// Check if Redis environment variables are available
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  // eslint-disable-next-line no-console
  console.error('Redis environment variables missing:', {
    hasUrl: !!redisUrl,
    hasToken: !!redisToken,
  });
}

// Fallback in-memory storage for development
const inMemoryStorage = new Map<string, { data: string; expiresAt: number }>();

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

const KEY_PREFIX = 'encryption_key:';
const KEY_TTL = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channelId, keyData } = body;

    if (!channelId || !keyData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Store the shared key in Redis
    const keyId = `${KEY_PREFIX}${channelId}_${userId}`;
    await redis?.setex(keyId, KEY_TTL, JSON.stringify(keyData));

    return NextResponse.json({ success: true, keyId });
  } catch (error) {
    logError('Error in encryption API route', error);
    return NextResponse.json(
      { error: 'Failed to share encryption key' },
      { status: 500 },
    );
  }
}

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

    // Retrieve shared key from Redis or in-memory storage
    const keyId = `${KEY_PREFIX}${channelId}_${userId}`;

    let keyDataString: string | null = null;

    if (redis) {
      // Try Redis first
      keyDataString = await redis.get<string>(keyId);
    } else {
      // Fallback to in-memory storage
      const stored = inMemoryStorage.get(keyId);
      if (stored && stored.expiresAt > Date.now()) {
        keyDataString = stored.data;
      } else if (stored) {
        // Clean up expired data
        inMemoryStorage.delete(keyId);
      }
    }

    if (!keyDataString) {
      return NextResponse.json(
        { error: 'No shared key found' },
        { status: 404 },
      );
    }

    const keyData = JSON.parse(keyDataString);
    return NextResponse.json({ keyData });
  } catch (error) {
    logError('Error in encryption API route', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Redis')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve encryption key' },
      { status: 500 },
    );
  }
}

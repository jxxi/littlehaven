/* eslint-disable no-console */
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

    if (redis) {
      // Ensure we're storing a JSON string, not an object
      const keyDataString = JSON.stringify(keyData);
      await redis.setex(keyId, KEY_TTL, keyDataString);
      console.log('Stored key in Redis:', {
        keyId,
        keyDataString: `${keyDataString.substring(0, 100)}...`,
      });
    } else {
      // Fallback to in-memory storage
      const expiresAt = Date.now() + KEY_TTL * 1000;
      inMemoryStorage.set(keyId, { data: JSON.stringify(keyData), expiresAt });
      console.log('Stored key in memory:', { keyId });
    }

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

    // Check if we need to clean up corrupted keys
    const cleanupKey = `${KEY_PREFIX}${channelId}_${userId}_cleanup`;
    const needsCleanup = await redis?.get(cleanupKey);

    if (!needsCleanup && redis) {
      // Try to clean up any corrupted keys for this user
      try {
        // Clean up corrupted keys for this specific channel
        const channelPattern = `${KEY_PREFIX}${channelId}_*`;
        const channelKeys = await redis.keys(channelPattern);

        await Promise.all(
          channelKeys.map(async (key) => {
            const value = await redis.get(key);
            if (value && typeof value === 'object') {
              console.log('Found corrupted channel key, cleaning up:', {
                key,
                valueType: typeof value,
              });
              await redis.del(key);
            }
          }),
        );

        // Also clean up any corrupted keys for this user across all channels
        const userPattern = `${KEY_PREFIX}*_${userId}`;
        const userKeys = await redis.keys(userPattern);

        await Promise.all(
          userKeys.map(async (key) => {
            const value = await redis.get(key);
            if (value && typeof value === 'object') {
              console.log('Found corrupted user key, cleaning up:', {
                key,
                valueType: typeof value,
              });
              await redis.del(key);
            }
          }),
        );

        // Mark cleanup as done
        await redis.setex(cleanupKey, 60, 'done'); // 1 minute TTL
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    // Log the request for debugging
    console.log('Encryption GET request:', {
      channelId,
      userId,
      hasRedis: !!redis,
    });

    // Retrieve shared key from Redis or in-memory storage
    const keyId = `${KEY_PREFIX}${channelId}_${userId}`;

    let keyDataString: string | null = null;

    if (redis) {
      // Try Redis first
      try {
        const rawValue = await redis.get(keyId);
        console.log('Redis raw lookup result:', {
          keyId,
          found: !!rawValue,
          type: typeof rawValue,
          isString: typeof rawValue === 'string',
          isObject: typeof rawValue === 'object',
        });

        // Handle different types of stored values
        if (typeof rawValue === 'string') {
          keyDataString = rawValue;
        } else if (typeof rawValue === 'object' && rawValue !== null) {
          // Found an object - this is corrupted data, clean it up
          console.log('Found corrupted object in Redis, cleaning up:', {
            keyId,
            rawValue,
          });
          await redis.del(keyId);
          keyDataString = null;
        } else {
          keyDataString = null;
        }

        if (keyDataString) {
          console.log('Redis lookup success:', {
            keyId,
            length: keyDataString.length,
            preview: keyDataString.substring(0, 100),
          });
        }
      } catch (redisError) {
        console.error('Redis error:', redisError);
        // Fall back to in-memory storage
      }
    }

    if (!keyDataString) {
      // Fallback to in-memory storage
      const stored = inMemoryStorage.get(keyId);
      if (stored && stored.expiresAt > Date.now()) {
        keyDataString = stored.data;
        console.log('In-memory storage lookup result:', {
          keyId,
          found: !!keyDataString,
        });
      } else if (stored) {
        // Clean up expired data
        inMemoryStorage.delete(keyId);
        console.log('Cleaned up expired key:', keyId);
      }
    }

    if (!keyDataString) {
      console.log('No key found for:', { keyId, channelId, userId });
      return NextResponse.json(
        { error: 'No shared key found' },
        { status: 404 },
      );
    }

    try {
      const keyData = JSON.parse(keyDataString);
      console.log('Successfully retrieved key data for:', keyId);
      return NextResponse.json({ keyData });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid key data format' },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Encryption API error:', error);
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

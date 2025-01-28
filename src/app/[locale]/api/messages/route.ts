import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { broadcastMessage } from '@/utils/message/broadcast';
import { createMessage, generateThumbnail } from '@/utils/message/operations';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const isMediaUpload = contentType?.includes('multipart/form-data');

    const body = await request.json();
    if (isMediaUpload) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const type = formData.get('type') as string;

      if (!file || !type) {
        return NextResponse.json(
          { error: 'Missing file or type' },
          { status: 400 },
        );
      }
      // Handle media upload...
    }

    const file = body.get('file') as File;
    const type = body.get('type') as string;
    const circleId = body.get('circleId') as string;
    const channelId = body.get('channelId') as string;
    const userId = body.get('userId') as string;

    if (!file || !circleId || !userId || !channelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Save to database
    const message = await createMessage(
      circleId,
      channelId,
      userId,
      pathname,
      poster,
    );

    // Broadcast the new message
    await broadcastMessage(message);

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 },
    );
  }
}

import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { broadcast } from '@/utils/message/broadcast';
import { createMessage, generateThumbnail } from '@/utils/message/operations';

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
  return createMessage(
    circleId,
    channelId,
    userId,
    content,
    pathname,
    type,
    poster,
  );
};

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

    // Broadcast the new message
    broadcast(message);

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 },
    );
  }
}

import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

import { createMessage, generateThumbnail } from '@/utils/message/operations';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const channelId = formData.get('channelId') as string;
    const userId = formData.get('userId') as string;

    if (!file || !channelId || !userId) {
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
      channelId,
      userId,
      '',
      blob.url,
      type,
      poster,
    );

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

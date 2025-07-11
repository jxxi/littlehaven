import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  createChannel,
  deleteChannel,
  getAllChannelsForCircle,
  getChannelById,
} from '@/utils/channel/operations';
import { logError } from '@/utils/Logger';

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const circleId = searchParams.get('circleId');
  const name = searchParams.get('name');
  const description = searchParams.get('description');
  const type = searchParams.get('type');

  try {
    if (!circleId || !name || !description || !type) {
      return NextResponse.json(
        { error: 'circleId, name, description, type are required' },
        { status: 400 },
      );
    }

    const newChannel = await createChannel(circleId, name, description, type);
    return NextResponse.json(newChannel, { status: 201 });
  } catch (error) {
    logError('Error in channels POST route', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to create channel',
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const circleId = searchParams.get('circleId');
  const channelId = searchParams.get('channelId');
  const name = searchParams.get('name');
  const description = searchParams.get('description');
  const type = searchParams.get('type');

  try {
    if (!channelId || !circleId || !name || !description || !type) {
      return NextResponse.json(
        { error: 'channelId, updates are required' },
        { status: 400 },
      );
    }

    const newChannel = await createChannel(circleId, name, description, type);
    return NextResponse.json(newChannel, { status: 201 });
  } catch (error) {
    logError('Error in channels PUT route', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to create channel',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  try {
    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 },
      );
    }
    const deletedChannel = await deleteChannel(channelId);
    return NextResponse.json(deletedChannel, { status: 200 });
  } catch (error) {
    logError('Error in channels DELETE route', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to delete channel',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const channelId = searchParams.get('channelId');
  const circleId = searchParams.get('circleId');

  if (channelId) {
    try {
      const channel = await getChannelById(channelId);
      return NextResponse.json(channel, { status: 200 });
    } catch (error) {
      logError('Error in channels GET route - getChannelById', error);
      return NextResponse.json(
        {
          message:
            error instanceof Error ? error.message : 'Failed to fetch channel',
        },
        { status: 500 },
      );
    }
  } else if (circleId) {
    try {
      const channels = await getAllChannelsForCircle(circleId);
      return NextResponse.json(channels, { status: 200 });
    } catch (error) {
      logError('Error in channels GET route - getAllChannelsForCircle', error);
      return NextResponse.json(
        {
          message:
            error instanceof Error
              ? error.message
              : 'Failed to fetch channels for circle',
        },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { message: 'Invalid query parameters' },
      { status: 400 },
    );
  }
}

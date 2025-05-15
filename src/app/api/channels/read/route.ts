import { updateChannelLastRead } from '@/utils/channel/operations';

export async function POST(req: Request) {
  const { channelId, userId } = await req.json();
  await updateChannelLastRead(userId, channelId);
  return new Response(null, { status: 200 });
}

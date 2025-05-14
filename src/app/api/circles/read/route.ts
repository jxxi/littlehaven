import { updateCircleLastRead } from '@/features/circle/operations';

export async function POST(req: Request) {
  const { circleId, userId } = await req.json();
  await updateCircleLastRead(userId, circleId);
  return new Response(null, { status: 200 });
}

import { broadcast } from '@/app/[locale]/api/messages/sse/route';

export async function broadcastMessage(message: any) {
  broadcast(message);
}

import type { NextRequest } from 'next/server';

import { addConnection, removeConnection } from '@/utils/message/broadcast';

export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const connectionId = Math.random().toString(36).slice(2);

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(':\n\n'));
      }, 30000);

      // Store connection
      addConnection(connectionId, controller);

      // Cleanup
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        removeConnection(connectionId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

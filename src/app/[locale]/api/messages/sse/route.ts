import type { NextRequest } from 'next/server';

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

// Helper to broadcast messages
export function broadcast(message: any) {
  const encoder = new TextEncoder();
  connections.forEach((controller) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
  });
}

export async function GET(request: NextRequest) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  // const circleId = request.nextUrl.searchParams.get('circleId');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Keep connection alive
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(':\n\n'));
      }, 30000);

      // Store the connection for later use
      const connectionId = Math.random().toString(36).slice(2);
      connections.set(connectionId, controller);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connections.delete(connectionId);
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

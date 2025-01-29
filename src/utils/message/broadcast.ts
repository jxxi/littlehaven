export const connections = new Map<string, ReadableStreamDefaultController>();

export function addConnection(
  id: string,
  controller: ReadableStreamDefaultController,
) {
  connections.set(id, controller);
}

export function removeConnection(id: string) {
  connections.delete(id);
}

export function broadcast(message: any) {
  const encoder = new TextEncoder();
  connections.forEach((controller) => {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
  });
}

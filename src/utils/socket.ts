import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { Env } from '@/libs/Env';
import { logError } from '@/utils/Logger';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const socketUrl = Env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {});
    socket.on('disconnect', () => {});
    socket.on('connect_error', (error) => {
      logError('Socket connection error', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

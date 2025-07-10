/* eslint-disable no-console */
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

import { Env } from '@/libs/Env';

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

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
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

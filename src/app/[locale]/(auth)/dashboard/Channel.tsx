'use client';

export interface Channel {
  channelId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice';
}

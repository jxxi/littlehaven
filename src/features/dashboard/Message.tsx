'use client';

export interface Message {
  messageId: string;
  content: string;
  userId: string;
  circleId: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  thumbnailUrl?: string;
  createdAt: string;
}

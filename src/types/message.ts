export interface Message {
  id: string;
  circleId: string;
  channelId: string;
  userId: string;
  content: string;
  isTts?: boolean;
  mediaUrl?: string | null;
  mediaType?: string | null;
  thumbnailUrl?: string | null;
  createdAt: Date;
  editedAt?: Date | null;
  isPinned?: boolean;
}

// For creating new messages
export type CreateMessage = Omit<Message, 'id' | 'createdAt' | 'editedAt'>;

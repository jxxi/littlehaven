import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  attachmentsSchema,
  messagesSchema,
  reactionsSchema,
} from '@/models/Schema';

// Create a new message
export async function createMessage(
  channelId: string,
  authorId: bigint,
  content: string,
  isTts?: boolean,
) {
  try {
    const newMessage = await db.insert(messagesSchema).values({
      channelId,
      authorId,
      content,
      isTts: isTts || false,
    });
    return newMessage; // Return the newly created message
  } catch (error) {
    throw new Error('Failed to create message');
  }
}

// Update an existing message
export async function updateMessage(
  messageId: string,
  updates: Partial<{ content: string; isPinned: boolean; editedAt: Date }>,
) {
  try {
    const updatedMessage = await db
      .update(messagesSchema)
      .set(updates)
      .where(eq(messagesSchema.messageId, messageId))
      .returning();
    return updatedMessage; // Return the updated message
  } catch (error) {
    throw new Error('Failed to update message');
  }
}

// Delete a message
export async function deleteMessage(messageId: string) {
  try {
    const deletedMessage = await db
      .delete(messagesSchema)
      .where(eq(messagesSchema.messageId, messageId))
      .returning();
    return deletedMessage; // Return the deleted message
  } catch (error) {
    throw new Error('Failed to delete message');
  }
}

// Get all messages for a specific channel
export async function getAllMessagesForChannel(channelId: string) {
  try {
    const messages = await db.query.messagesSchema.findMany({
      where: eq(messagesSchema.channelId, channelId),
    });
    return messages; // Return the list of messages
  } catch (error) {
    throw new Error('Failed to fetch messages for channel');
  }
}

// Get a specific message by message ID
export async function getMessageById(messageId: string) {
  try {
    const message = await db.query.messagesSchema.findFirst({
      where: eq(messagesSchema.messageId, messageId),
    });
    return message || null; // Return null if no message is found
  } catch (error) {
    throw new Error('Failed to fetch message');
  }
}

// Create an attachment for a message
export async function createAttachment(
  messageId: string,
  filename: string,
  size: number,
  url: string,
  proxyUrl?: string,
  contentType?: string,
) {
  try {
    const newAttachment = await db.insert(attachmentsSchema).values({
      messageId,
      filename,
      size,
      url,
      proxyUrl,
      contentType,
    });
    return newAttachment; // Return the newly created attachment
  } catch (error) {
    throw new Error('Failed to create attachment');
  }
}

// Delete an attachment
export async function deleteAttachment(attachmentId: string) {
  try {
    const deletedAttachment = await db
      .delete(attachmentsSchema)
      .where(eq(attachmentsSchema.attachmentId, attachmentId))
      .returning();
    return deletedAttachment; // Return the deleted attachment
  } catch (error) {
    throw new Error('Failed to delete attachment');
  }
}

// Create a reaction for a message
export async function createReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  try {
    const newReaction = await db.insert(reactionsSchema).values({
      messageId,
      userId,
      emoji,
    });
    return newReaction; // Return the newly created reaction
  } catch (error) {
    throw new Error('Failed to create reaction');
  }
}

// Delete a reaction
export async function deleteReaction(
  messageId: string,
  userId: string,
  emoji: string,
) {
  try {
    const deletedReaction = await db
      .delete(reactionsSchema)
      .where(eq(reactionsSchema.messageId, messageId))
      .where(eq(reactionsSchema.userId, userId))
      .where(eq(reactionsSchema.emoji, emoji))
      .returning();
    return deletedReaction; // Return the deleted reaction
  } catch (error) {
    throw new Error('Failed to delete reaction');
  }
}

// Get all reactions for a specific message
export async function getAllReactionsForMessage(messageId: string) {
  try {
    const reactions = await db.query.reactionsSchema.findMany({
      where: eq(reactionsSchema.messageId, messageId),
    });
    return reactions; // Return the list of reactions
  } catch (error) {
    throw new Error('Failed to fetch reactions for message');
  }
}

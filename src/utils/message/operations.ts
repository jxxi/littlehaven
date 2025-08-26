/* eslint-disable no-console */
import { clerkClient } from '@clerk/nextjs/server';
import { asc, desc, eq, gt, lt } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  attachmentsSchema,
  messagesSchema,
  reactionsSchema,
} from '@/models/Schema';
import { logError } from '@/utils/Logger';

export async function createMessage(
  circleId: string,
  channelId: string,
  userId: string,
  content: string,
  mediaUrl?: string,
  mediaType?: string,
  thumbnailUrl?: string,
  isTts?: boolean,
  replyToMessageId?: string,
  encryptedContent?: string,
  encryptionKeyId?: string,
  encryptionIv?: string,
  isEncrypted?: boolean,
) {
  try {
    const [newMessage] = await db
      .insert(messagesSchema)
      .values({
        circleId,
        channelId,
        userId,
        content: isEncrypted ? '' : content, // Store empty content for encrypted messages
        encryptedContent,
        encryptionKeyId,
        encryptionIv,
        isEncrypted: isEncrypted || false,
        isTts: isTts || false,
        mediaUrl,
        mediaType,
        thumbnailUrl,
        replyToMessageId,
      })
      .returning();

    // Get user information
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return {
      ...newMessage,
      user: {
        username: user.username || 'Unknown User',
        imageUrl: user.imageUrl,
      },
    };
  } catch (error) {
    logError('Error in createMessage', error);
    throw new Error('Failed to create message');
  }
}

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
    logError('Error in updateMessage', error);
    throw new Error('Failed to update message');
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const deletedMessage = await db
      .delete(messagesSchema)
      .where(eq(messagesSchema.messageId, messageId))
      .returning();
    return deletedMessage; // Return the deleted message
  } catch (error) {
    logError('Error in deleteMessage', error);
    throw new Error('Failed to delete message');
  }
}

export async function getAllMessagesForCircle(circleId: string) {
  try {
    const messages = await db.query.messagesSchema.findMany({
      where: eq(messagesSchema.circleId, circleId),
    });
    return messages; // Return the list of messages
  } catch (error) {
    logError('Error in getAllMessagesForCircle', error);
    throw new Error('Failed to fetch messages for circle');
  }
}

export async function getAllMessagesForChannel(channelId: string) {
  try {
    const messages = await db.query.messagesSchema.findMany({
      where: eq(messagesSchema.channelId, channelId),
    });

    // Get user information for each message
    const client = await clerkClient();
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await client.users.getUser(message.userId);
        return {
          ...message,
          user: {
            username: user.username || 'Unknown User',
            imageUrl: user.imageUrl,
          },
        };
      }),
    );

    return messagesWithUsers;
  } catch (error) {
    logError('Error in getAllMessagesForChannel', error);
    throw new Error('Failed to fetch messages for channel');
  }
}

export async function getMessageById(messageId: string) {
  try {
    const message = await db.query.messagesSchema.findFirst({
      where: eq(messagesSchema.messageId, messageId),
    });
    return message || null; // Return null if no message is found
  } catch (error) {
    logError('Error in getMessageById', error);
    throw new Error('Failed to fetch message');
  }
}

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
    logError('Error in createAttachment', error);
    throw new Error('Failed to create attachment');
  }
}

export async function deleteAttachment(attachmentId: string) {
  try {
    const deletedAttachment = await db
      .delete(attachmentsSchema)
      .where(eq(attachmentsSchema.attachmentId, attachmentId))
      .returning();
    return deletedAttachment;
  } catch (error) {
    logError('Error in deleteAttachment', error);
    throw new Error('Failed to delete attachment');
  }
}

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
    logError('Error in createReaction', error);
    throw new Error('Failed to create reaction');
  }
}

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
    logError('Error in deleteReaction', error);
    throw new Error('Failed to delete reaction');
  }
}

export async function getAllReactionsForMessage(messageId: string) {
  try {
    const reactions = await db.query.reactionsSchema.findMany({
      where: eq(reactionsSchema.messageId, messageId),
    });
    return reactions;
  } catch (error) {
    logError('Error in getAllReactionsForMessage', error);
    throw new Error('Failed to fetch reactions for message');
  }
}

async function getMessagesWithUsers(messages: any[]): Promise<any[]> {
  if (messages.length === 0) return messages;

  // Get unique user IDs to avoid duplicate API calls
  const uniqueUserIds = [...new Set(messages.map((msg) => msg.userId))];

  // Batch fetch all users at once
  const client = await clerkClient();
  const users = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const user = await client.users.getUser(userId);
        return {
          userId,
          username: user.username || 'Unknown User',
          imageUrl: user.imageUrl,
        };
      } catch (error) {
        console.warn(`Failed to fetch user ${userId}:`, error);
        return {
          userId,
          username: 'Unknown User',
          imageUrl: null,
        };
      }
    }),
  );

  // Create a map for fast lookups
  const userMap = new Map(users.map((user) => [user.userId, user]));

  // Attach user data to messages
  return messages.map((message) => ({
    ...message,
    user: userMap.get(message.userId) || {
      username: 'Unknown User',
      imageUrl: null,
    },
  }));
}

export async function getAllMessagesWithReactionsForChannel(
  channelId: string,
  options?: { before?: string; after?: string; limit?: number },
) {
  try {
    const { before, after, limit = 50 } = options || {};
    console.log('getAllMessagesWithReactionsForChannel called with:', {
      channelId,
      before,
      after,
      limit,
    });

    // Build where clause
    const where = [eq(messagesSchema.channelId, channelId)];
    let order = desc(messagesSchema.createdAt);
    let reverse = true;

    if (after) {
      console.log('Adding after filter:', after);
      where.push(gt(messagesSchema.createdAt, new Date(after)));
      order = asc(messagesSchema.createdAt);
      reverse = false;
    } else if (before) {
      console.log('Adding before filter:', before);
      where.push(lt(messagesSchema.createdAt, new Date(before)));
      order = desc(messagesSchema.createdAt);
      reverse = true;
    }

    console.log('Executing database query...');

    // Join messages and reactions
    const rows = await db
      .select({
        ...messagesSchema,
        reactionUserId: reactionsSchema.userId,
        reactionEmoji: reactionsSchema.emoji,
      })
      .from(messagesSchema)
      .leftJoin(
        reactionsSchema,
        eq(messagesSchema.messageId, reactionsSchema.messageId),
      )
      .where(where.length > 1 ? { and: where } : where[0])
      .orderBy(order)
      .limit(limit);

    console.log('Database query completed, rows returned:', rows.length);

    // Group by message, then group reactions by emoji
    const messageMap = new Map();
    for (const row of rows) {
      const msgId = row.messageId;
      if (!messageMap.has(msgId)) {
        messageMap.set(msgId, {
          ...row,
          reactions: {},
        });
      }
      if (row.reactionEmoji && row.reactionUserId) {
        const msg = messageMap.get(msgId);
        if (!msg.reactions[row.reactionEmoji]) {
          msg.reactions[row.reactionEmoji] = [];
        }
        msg.reactions[row.reactionEmoji].push(row.reactionUserId);
      }
    }

    // Convert reactions object to array
    let result = Array.from(messageMap.values()).map((msg) => ({
      ...msg,
      reactions: Object.entries(msg.reactions).map(([emoji, userIds]) => ({
        emoji,
        userIds,
      })),
    }));
    if (reverse) result = result.reverse();

    console.log('Processing user data for messages...');
    result = await getMessagesWithUsers(result);
    console.log('Successfully processed messages with users:', result.length);

    return result;
  } catch (error) {
    console.error('Error in getAllMessagesWithReactionsForChannel:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      channelId,
      options,
    });
    logError('Error in getAllMessagesWithReactionsForChannel', error);
    throw new Error('Failed to fetch messages for channel');
  }
}

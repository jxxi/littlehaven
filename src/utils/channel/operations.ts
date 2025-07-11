// src/utils/channel/operations.ts
import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB'; // Adjust the import based on your database setup
import {
  channelPermissionsSchema,
  channelSchema,
  userChannelsSchema,
} from '@/models/Schema';
import { logError } from '@/utils/Logger';

// Create a new channel
export async function createChannel(
  circleId: string,
  name: string,
  description: string,
  type: string,
  position?: number,
  topic?: string,
  isNsfw?: boolean,
) {
  try {
    const newChannel = await db.insert(channelSchema).values({
      circleId,
      name,
      description,
      type,
      position,
      topic,
      isNsfw: isNsfw || false,
    });
    return newChannel; // Return the newly created channel
  } catch (error) {
    logError('Error in createChannel', error);
    throw new Error('Failed to create channel');
  }
}

// Update an existing channel
export async function updateChannel(
  channelId: string,
  updates: Partial<{
    name: string;
    type: string;
    position: number;
    topic: string;
    isNsfw: boolean;
  }>,
) {
  try {
    const updatedChannel = await db
      .update(channelSchema)
      .set(updates)
      .where(eq(channelSchema.channelId, channelId))
      .returning();
    return updatedChannel; // Return the updated channel
  } catch (error) {
    logError('Error in updateChannel', error);
    throw new Error('Failed to update channel');
  }
}

// Delete a channel
export async function deleteChannel(channelId: string) {
  try {
    const deletedChannel = await db
      .delete(channelSchema)
      .where(eq(channelSchema.channelId, channelId))
      .returning();
    return deletedChannel; // Return the deleted channel
  } catch (error) {
    logError('Error in deleteChannel', error);
    throw new Error('Failed to delete channel');
  }
}

// Get all channels for a specific circle ID
export async function getAllChannelsForCircle(circleId: string) {
  try {
    const channels = await db.query.channelSchema.findMany({
      where: eq(channelSchema.circleId, circleId),
    });
    return channels; // Return the list of channels
  } catch (error) {
    logError('Error in getAllChannelsForCircle', error);
    throw new Error('Failed to fetch channels for circle');
  }
}

// Get a specific channel by channel ID
export async function getChannelById(channelId: string) {
  try {
    const channel = await db.query.channelSchema.findFirst({
      where: eq(channelSchema.channelId, channelId),
    });
    return channel || null; // Return null if no channel is found
  } catch (error) {
    logError('Error in getChannelById', error);
    throw new Error('Failed to fetch channel');
  }
}

// Create channel permissions
export async function createChannelPermission(
  channelId: string,
  roleId: bigint,
  allowPermissions: bigint,
  denyPermissions: bigint,
) {
  try {
    const newPermission = await db.insert(channelPermissionsSchema).values({
      channelId,
      roleId,
      allowPermissions,
      denyPermissions,
    });
    return newPermission; // Return the newly created permission
  } catch (error) {
    logError('Error in createChannelPermission', error);
    throw new Error('Failed to create channel permission');
  }
}

// Update channel permissions
export async function updateChannelPermission(
  channelId: string,
  roleId: number,
  updates: Partial<{ allowPermissions: bigint; denyPermissions: bigint }>,
) {
  try {
    const updatedPermission = await db
      .update(channelPermissionsSchema)
      .set(updates)
      .where(eq(channelPermissionsSchema.channelId, channelId))
      .where(eq(channelPermissionsSchema.roleId, roleId))
      .returning();
    return updatedPermission; // Return the updated permission
  } catch (error) {
    logError('Error in updateChannelPermission', error);
    throw new Error('Failed to update channel permission');
  }
}

// Delete channel permissions
export async function deleteChannelPermission(
  channelId: string,
  roleId: number,
) {
  try {
    const deletedPermission = await db
      .delete(channelPermissionsSchema)
      .where(eq(channelPermissionsSchema.channelId, channelId))
      .where(eq(channelPermissionsSchema.roleId, roleId))
      .returning();
    return deletedPermission; // Return the deleted permission
  } catch (error) {
    logError('Error in deleteChannelPermission', error);
    throw new Error('Failed to delete channel permission');
  }
}

// Get all permissions for a specific channel
export async function getAllPermissionsForChannel(channelId: string) {
  try {
    const permissions = await db.query.channelPermissionsSchema.findMany({
      where: eq(channelPermissionsSchema.channelId, channelId),
    });
    return permissions; // Return the list of permissions
  } catch (error) {
    logError('Error in getAllPermissionsForChannel', error);
    throw new Error('Failed to fetch permissions for channel');
  }
}

export async function updateChannelLastRead(userId: string, channelId: string) {
  return db
    .insert(userChannelsSchema)
    .values({ userId, channelId, lastReadTimestamp: new Date() })
    .onConflictDoUpdate({
      target: [userChannelsSchema.userId, userChannelsSchema.channelId],
      set: { lastReadTimestamp: new Date() },
    });
}

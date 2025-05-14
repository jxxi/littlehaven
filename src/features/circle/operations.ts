import { and, eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  channelSchema,
  circleMembersSchema,
  userChannelsSchema,
} from '@/models/Schema';

export async function updateCircleLastRead(userId: string, circleId: string) {
  return db
    .update(circleMembersSchema)
    .set({ lastReadTimestamp: new Date() })
    .where(
      and(
        eq(circleMembersSchema.userId, userId),
        eq(circleMembersSchema.circleId, circleId),
      ),
    );
}

export async function getUnreadStatus(userId: string) {
  const members = await db
    .select({
      circleId: circleMembersSchema.circleId,
      lastRead: circleMembersSchema.lastReadTimestamp,
      channels: channelSchema,
    })
    .from(circleMembersSchema)
    .leftJoin(
      channelSchema,
      eq(channelSchema.circleId, circleMembersSchema.circleId),
    )
    .where(eq(circleMembersSchema.userId, userId));

  return members.reduce(
    (acc, member) => {
      const isUnread = member.channels.lastMessageTimestamp > member.lastRead;
      if (isUnread) {
        acc.unreadCircles.add(member.circleId);
        acc.unreadChannels.add(member.channels.channelId);
      }
      return acc;
    },
    {
      unreadCircles: new Set<string>(),
      unreadChannels: new Set<string>(),
    },
  );
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

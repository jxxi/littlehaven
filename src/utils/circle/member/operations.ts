import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  circleMembersSchema,
  invitesSchema,
  memberRolesSchema,
} from '@/models/Schema';

// Create a new circle member
export async function createCircleMember(
  circleId: string,
  userId: string,
  nickname: string,
  bio: string,
) {
  try {
    const newMember = await db.insert(circleMembersSchema).values({
      circleId,
      userId,
      nickname,
      bio,
    });
    return newMember; // Return the newly created member
  } catch (error) {
    throw new Error('Failed to create circle member');
  }
}

// Update an existing circle member
export async function updateCircleMember(
  circleId: string,
  userId: string,
  updates: Partial<{
    nickname: string;
    bio: string;
    isDeafened: boolean;
    isMuted: boolean;
  }>,
) {
  try {
    const updatedMember = await db
      .update(circleMembersSchema)
      .set(updates)
      .where(eq(circleMembersSchema.circleId, circleId))
      .where(eq(circleMembersSchema.userId, userId))
      .returning();
    return updatedMember; // Return the updated member
  } catch (error) {
    throw new Error('Failed to update circle member');
  }
}

// Delete a circle member
export async function deleteCircleMember(circleId: string, userId: string) {
  try {
    const deletedMember = await db
      .delete(circleMembersSchema)
      .where(eq(circleMembersSchema.circleId, circleId))
      .where(eq(circleMembersSchema.userId, userId))
      .returning();
    return deletedMember; // Return the deleted member
  } catch (error) {
    throw new Error('Failed to delete circle member');
  }
}

// Get all members for a specific circle ID
export async function getAllMembersForCircle(circleId: string) {
  try {
    const members = await db.query.circleMembersSchema.findMany({
      where: eq(circleMembersSchema.circleId, circleId),
    });
    return members; // Return the list of members
  } catch (error) {
    throw new Error('Failed to fetch members for circle');
  }
}

// Get a specific member by circle ID and user ID
export async function getMemberByCircleIdAndUserId(
  circleId: string,
  userId: string,
) {
  try {
    const member = await db.query.circleMembersSchema.findFirst({
      where: [
        eq(circleMembersSchema.circleId, circleId),
        eq(circleMembersSchema.userId, userId),
      ],
    });
    return member || null; // Return null if no member is found
  } catch (error) {
    throw new Error('Failed to fetch member');
  }
}

// Create a new member role
export async function createMemberRole(
  circleId: string,
  userId: string,
  roleId: bigint,
) {
  try {
    const newMemberRole = await db.insert(memberRolesSchema).values({
      circleId,
      userId,
      roleId,
    });
    return newMemberRole; // Return the newly created member role
  } catch (error) {
    throw new Error('Failed to create member role');
  }
}

// Update an existing member role
export async function updateMemberRole(
  circleId: string,
  userId: string,
  updates: Partial<{ roleId: bigint }>,
) {
  try {
    const updatedMemberRole = await db
      .update(memberRolesSchema)
      .set(updates)
      .where(eq(memberRolesSchema.circleId, circleId))
      .where(eq(memberRolesSchema.userId, userId))
      .returning();
    return updatedMemberRole; // Return the updated member role
  } catch (error) {
    throw new Error('Failed to update member role');
  }
}

// Delete a member role
export async function deleteMemberRole(circleId: string, userId: string) {
  try {
    const deletedMemberRole = await db
      .delete(memberRolesSchema)
      .where(eq(memberRolesSchema.circleId, circleId))
      .where(eq(memberRolesSchema.userId, userId))
      .returning();
    return deletedMemberRole; // Return the deleted member role
  } catch (error) {
    throw new Error('Failed to delete member role');
  }
}

// Get all roles for a specific user in a circle
export async function getRolesForUserInCircle(
  circleId: string,
  userId: string,
) {
  try {
    const roles = await db.query.memberRolesSchema.findMany({
      where: [
        eq(memberRolesSchema.circleId, circleId),
        eq(memberRolesSchema.userId, userId),
      ],
    });
    return roles; // Return the list of roles
  } catch (error) {
    throw new Error('Failed to fetch roles for user in circle');
  }
}

export async function createInvite(
  inviteCode: string,
  circleId: string,
  channelId: string,
  inviterId: string,
  maxUses?: number,
  maxAge?: number,
  isTemporary?: boolean,
) {
  try {
    const newInvite = await db.insert(invitesSchema).values({
      inviteCode,
      circleId,
      channelId,
      inviterId,
      maxUses: maxUses || null,
      maxAge: maxAge || null,
      isTemporary: isTemporary || false,
    });
    return newInvite; // Return the newly created invite
  } catch (error) {
    throw new Error('Failed to create invite');
  }
}

// Update an existing invite
export async function updateInvite(
  inviteCode: string,
  updates: Partial<{
    maxUses: number;
    maxAge: number;
    expiresAt: Date;
    isTemporary: boolean;
  }>,
) {
  try {
    const updatedInvite = await db
      .update(invitesSchema)
      .set(updates)
      .where(eq(invitesSchema.inviteCode, inviteCode))
      .returning();
    return updatedInvite; // Return the updated invite
  } catch (error) {
    throw new Error('Failed to update invite');
  }
}

// Delete an invite
export async function deleteInvite(inviteCode: string) {
  try {
    const deletedInvite = await db
      .delete(invitesSchema)
      .where(eq(invitesSchema.inviteCode, inviteCode))
      .returning();
    return deletedInvite; // Return the deleted invite
  } catch (error) {
    throw new Error('Failed to delete invite');
  }
}

// Get all invites for a specific circle
export async function getAllInvitesForCircle(circleId: string) {
  try {
    const invites = await db.query.invitesSchema.findMany({
      where: eq(invitesSchema.circleId, circleId),
    });
    return invites; // Return the list of invites
  } catch (error) {
    throw new Error('Failed to fetch invites for circle');
  }
}

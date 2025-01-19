import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { circleMembersSchema, type InsertCircleMember } from '@/models/Schema';

export async function getCircleMembers(circleId: string) {
  return db.query.circleMembersSchema.findMany({
    where: eq(circleMembersSchema.circleId, circleId),
  });
}

export async function getCircleMember(circleId: string, userId: string) {
  try {
    const member = await db.query.circleMembersSchema.findFirst({
      where: [
        eq(circleMembersSchema.circleId, circleId),
        eq(circleMembersSchema.userId, userId),
      ],
    });

    return member || null; // Return null if no member is found
  } catch (error) {
    throw new Error('Failed to fetch circle member'); // Handle error appropriately
  }
}

export async function createCircleMember(circleMember: InsertCircleMember) {
  return db.insert(circleMembersSchema).values(circleMember).returning();
}

export async function updateCircleMember(
  circleId: string,
  id: string,
  data: Record<string, any>,
) {
  return db
    .update(circleMembersSchema)
    .set(data) // Use the provided JSON data to update the columns
    .where(eq(circleMembersSchema.circleId, circleId))
    .where(eq(circleMembersSchema.userId, id))
    .returning();
}

export async function deleteCircleMember(circleId: string, id: string) {
  return db
    .delete(circleMembersSchema)
    .where(eq(circleMembersSchema.circleId, circleId))
    .where(eq(circleMembersSchema.userId, id))
    .returning();
}

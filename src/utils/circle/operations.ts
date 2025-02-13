import { eq } from 'drizzle-orm';

import { db } from '@/libs/DB';
import {
  circleMembersSchema,
  circlesSchema,
  type InsertCircle,
} from '@/models/Schema';

export async function getCircle(circleId: string) {
  return db.query.circlesSchema.findFirst({
    where: eq(circlesSchema.circleId, circleId),
  });
}

export async function getPublicCircles() {
  return db.query.circlesSchema.findMany({
    where: eq(circlesSchema.isPublic, true),
  });
}

export async function getCircleOwnerByUserId(userId: string) {
  return db.query.circlesSchema.findMany({
    where: eq(circlesSchema.ownerId, userId),
  });
}

export async function getCirclesMemberUserId(userId: string) {
  return db.query.circleMembersSchema.findMany({
    where: eq(circleMembersSchema.userId, userId),
  });
}

export async function getCirclesWithMemberByUserId(userId: string) {
  return db.query.circleMembersSchema.findMany({
    where: eq(circleMembersSchema.userId, userId),
    include: {
      circles: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function createCircle(circle: InsertCircle) {
  return db.insert(circlesSchema).values(circle).returning();
}

export async function updateCircle(
  circleId: string,
  circle: Partial<InsertCircle>,
) {
  return db
    .update(circlesSchema)
    .set(circle)
    .where(eq(circlesSchema.circleId, circleId))
    .returning();
}

export async function deleteCircle(circleId: string) {
  return db
    .delete(circlesSchema)
    .where(eq(circlesSchema.circleId, circleId))
    .returning();
}

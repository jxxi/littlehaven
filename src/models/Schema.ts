import {
  bigint,
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { tagNameEnum } from '@/constants/tags';

export const circlesSchema = pgTable('circles', {
  circleId: uuid('circle_id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  iconUrl: text('icon_url'),
  ownerId: varchar('owner_id', { length: 40 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  region: varchar('region', { length: 50 }),
  maxMembers: integer('max_members').default(500000),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
});

export type InsertCircle = typeof circlesSchema.$inferInsert;
export type SelectCircle = typeof circlesSchema.$inferSelect;

export const rolesSchema = pgTable('roles', {
  roleId: bigint('role_id', { mode: 'number' }).primaryKey(),
  circleId: uuid('circle_id').references(() => circlesSchema.circleId, {
    onDelete: 'cascade',
  }),
  name: varchar('name', { length: 100 }).notNull(),
  color: integer('color'),
  position: integer('position').notNull(),
  permissions: bigint('permissions', { mode: 'number' }).notNull(),
  isMentionable: boolean('is_mentionable').default(true),
  isHoisted: boolean('is_hoisted').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type InsertRole = typeof rolesSchema.$inferInsert;
export type SelectRole = typeof rolesSchema.$inferSelect;

export const channelSchema = pgTable('channels', {
  channelId: uuid('channel_id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id')
    .notNull()
    .references(() => circlesSchema.circleId, {
      onDelete: 'cascade',
    }),
  name: varchar('name', { length: 100 }).notNull(),
  desription: varchar('description', { length: 20 }),
  type: varchar('type', { length: 20 }),
  position: integer('position'),
  topic: text('topic'),
  isNsfw: boolean('is_nsfw').default(false),
  rateLimitPerUser: integer('rate_limit_per_user').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type Insertchannel = typeof channelSchema.$inferInsert;
export type Selectchannel = typeof channelSchema.$inferSelect;

export const channelPermissionsSchema = pgTable(
  'channel_permissions',
  {
    channelId: uuid('channel_id').references(() => channelSchema.channelId, {
      onDelete: 'cascade',
    }),
    roleId: bigint('role_id', { mode: 'number' }).references(
      () => rolesSchema.roleId,
      { onDelete: 'cascade' },
    ),
    allowPermissions: bigint('allow_permissions', { mode: 'number' })
      .notNull()
      .default(0),
    denyPermissions: bigint('deny_permissions', { mode: 'number' })
      .notNull()
      .default(0),
  },
  (table) => ({
    pk: (table.channelId, table.roleId),
  }),
);

export type InsertChannelPermission =
  typeof channelPermissionsSchema.$inferInsert;
export type SelectChannelPermission =
  typeof channelPermissionsSchema.$inferSelect;

export const messagesSchema = pgTable('messages', {
  messageId: uuid('message_id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id')
    .notNull()
    .references(() => circlesSchema.circleId, { onDelete: 'cascade' }),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => channelSchema.channelId, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 100 }).notNull(),
  content: text('content').notNull(),
  isTts: boolean('is_tts').default(false),
  mediaUrl: text('media_url'),
  mediaType: text('media_type'),
  thumbnailUrl: text('thumbnail_url'),
  createdAt: timestamp('created_at').defaultNow(),
  editedAt: timestamp('edited_at'),
  isPinned: boolean('is_pinned').default(false),
});

export type InsertMessages = typeof messagesSchema.$inferInsert;
export type SelectMessages = typeof messagesSchema.$inferSelect;

export const attachmentsSchema = pgTable('attachments', {
  attachmentId: uuid('attachment_id').defaultRandom().primaryKey(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => messagesSchema.messageId, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  proxyUrl: text('proxy_url'),
  contentType: varchar('content_type', { length: 100 }),
});

export type InsertAttachment = typeof attachmentsSchema.$inferInsert;
export type SelectAttachment = typeof attachmentsSchema.$inferSelect;

export const reactionsSchema = pgTable(
  'reactions',
  {
    messageId: uuid('message_id').references(() => messagesSchema.messageId, {
      onDelete: 'cascade',
    }),
    userId: varchar('user_id', { length: 100 }).notNull(),
    emoji: varchar('emoji', { length: 32 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey(table.messageId, table.userId, table.emoji),
  }),
);

export type InsertReaction = typeof reactionsSchema.$inferInsert;
export type SelectReaction = typeof reactionsSchema.$inferSelect;

export const circleMembersSchema = pgTable(
  'circle_members',
  {
    memberId: uuid('member_id').defaultRandom().primaryKey(),
    circleId: uuid('circle_id').references(() => circlesSchema.circleId, {
      onDelete: 'cascade',
    }),
    userId: varchar('user_id', { length: 40 }).notNull(),
    nickname: varchar('nickname', { length: 12 }),
    bio: varchar('bio', { length: 32 }),
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
    isDeafened: boolean('is_deafened').default(false),
    isMuted: boolean('is_muted').default(false),
  },
  (table) => ({
    pk: (table.circleId, table.userId),
  }),
);

export type InsertCircleMember = typeof circleMembersSchema.$inferInsert;
export type SelectCircleMember = typeof circleMembersSchema.$inferSelect;

export const memberRolesSchema = pgTable(
  'member_roles',
  {
    circleId: uuid('circle_id'),
    userId: varchar('user_id', { length: 100 }).notNull(),
    roleId: bigint('role_id', { mode: 'number' }).references(
      () => rolesSchema.roleId,
      { onDelete: 'cascade' },
    ),
  },
  (table) => ({
    pk: (table.circleId, table.userId, table.roleId),
  }),
);

export type InsertMemberRoles = typeof memberRolesSchema.$inferInsert;
export type SelectMemberRoles = typeof memberRolesSchema.$inferSelect;

export const invitesSchema = pgTable('invites', {
  inviteCode: varchar('invite_code', { length: 10 }).primaryKey(),
  circleId: uuid('circle_id')
    .notNull()
    .references(() => circlesSchema.circleId, { onDelete: 'cascade' }),
  channelId: uuid('channel_id')
    .notNull()
    .references(() => channelSchema.channelId, { onDelete: 'cascade' }),
  inviterId: varchar('inviter_id', { length: 100 }).notNull(),
  maxUses: integer('max_uses'),
  maxAge: integer('max_age'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  uses: integer('uses').default(0),
  isTemporary: boolean('is_temporary').default(false),
});

export type InsertInvite = typeof invitesSchema.$inferInsert;
export type SelectInvite = typeof invitesSchema.$inferSelect;

export const circleTagsSchema = pgTable(
  'circle_tags',
  {
    circleId: uuid('circle_id').references(() => circlesSchema.circleId, {
      onDelete: 'cascade',
    }),
    tagName: tagNameEnum('tag_name').notNull(),
    addedAt: timestamp('added_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey(table.circleId, table.tagName),
  }),
);

export type InsertCircleTag = typeof circleTagsSchema.$inferInsert;
export type SelectCircleTag = typeof circleTagsSchema.$inferSelect;

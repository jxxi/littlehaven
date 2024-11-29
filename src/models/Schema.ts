import {
  bigint,
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const serversSchema = pgTable('servers', {
  serverId: bigint('server_id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  iconUrl: text('icon_url'),
  ownerId: bigint('owner_id', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  region: varchar('region', { length: 50 }),
  maxMembers: integer('max_members').default(500000),
  description: text('description'),
});

export const usersSchema = pgTable('users', {
  userId: varchar('user_id', { length: 100 }).primaryKey(),
  username: varchar('username', { length: 32 }).notNull(),
  bio: varchar('bio', { length: 100 }),
  joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
});

export const rolesSchema = pgTable('roles', {
  roleId: bigint('role_id', { mode: 'number' }).primaryKey(),
  serverId: bigint('server_id', { mode: 'number' })
    .notNull()
    .references(() => serversSchema.serverId, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  color: integer('color'),
  position: integer('position').notNull(),
  permissions: bigint('permissions', { mode: 'number' }).notNull(),
  isMentionable: boolean('is_mentionable').default(true),
  isHoisted: boolean('is_hoisted').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const channelsSchema = pgTable('channels', {
  channelId: bigint('channel_id', { mode: 'number' }).primaryKey(),
  serverId: bigint('server_id', { mode: 'number' }).references(
    () => serversSchema.serverId,
    { onDelete: 'cascade' },
  ),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(),
  position: integer('position'),
  topic: text('topic'),
  isNsfw: boolean('is_nsfw').default(false),
  parentId: bigint('parent_id', { mode: 'number' }).references(
    () => channelsSchema.channelId,
    { onDelete: 'set null' },
  ),
  rateLimitPerUser: integer('rate_limit_per_user').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const channelPermissionsSchema = pgTable(
  'channel_permissions',
  {
    channelId: bigint('channel_id', { mode: 'number' }).references(
      () => channelsSchema.channelId,
      { onDelete: 'cascade' },
    ),
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

export const messagesSchema = pgTable('messages', {
  messageId: bigint('message_id', { mode: 'number' }).primaryKey(),
  channelId: bigint('channel_id', { mode: 'number' })
    .notNull()
    .references(() => channelsSchema.channelId, { onDelete: 'cascade' }),
  authorId: bigint('author_id', { mode: 'number' }).notNull(),
  content: text('content'),
  isPinned: boolean('is_pinned').default(false),
  isTts: boolean('is_tts').default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  editedAt: timestamp('edited_at', { mode: 'date' }),
  referencedMessageId: bigint('referenced_message_id', {
    mode: 'number',
  }).references(() => messagesSchema.messageId, { onDelete: 'set null' }),
});

export const attachmentsSchema = pgTable('attachments', {
  attachmentId: bigint('attachment_id', { mode: 'number' }).primaryKey(),
  messageId: bigint('message_id', { mode: 'number' })
    .notNull()
    .references(() => messagesSchema.messageId, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  proxyUrl: text('proxy_url'),
  contentType: varchar('content_type', { length: 100 }),
});

export const reactionsSchema = pgTable(
  'reactions',
  {
    messageId: bigint('message_id', { mode: 'number' }).references(
      () => messagesSchema.messageId,
      { onDelete: 'cascade' },
    ),
    userId: bigint('user_id', { mode: 'number' }),
    emoji: varchar('emoji', { length: 32 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey(table.messageId, table.userId, table.emoji),
  }),
);

export const serverMembersSchema = pgTable(
  'server_members',
  {
    serverId: bigint('server_id', { mode: 'number' }).references(
      () => serversSchema.serverId,
      { onDelete: 'cascade' },
    ),
    userId: bigint('user_id', { mode: 'number' }),
    nickname: varchar('nickname', { length: 32 }),
    joinedAt: timestamp('joined_at', { mode: 'date' }).defaultNow().notNull(),
    isDeafened: boolean('is_deafened').default(false),
    isMuted: boolean('is_muted').default(false),
  },
  (table) => ({
    pk: (table.serverId, table.userId),
  }),
);

export const memberRolesSchema = pgTable(
  'member_roles',
  {
    serverId: bigint('server_id', { mode: 'number' }),
    userId: bigint('user_id', { mode: 'number' }),
    roleId: bigint('role_id', { mode: 'number' }).references(
      () => rolesSchema.roleId,
      { onDelete: 'cascade' },
    ),
  },
  (table) => ({
    pk: (table.serverId, table.userId, table.roleId),
  }),
);

export const invitesSchema = pgTable('invites', {
  inviteCode: varchar('invite_code', { length: 10 }).primaryKey(),
  serverId: bigint('server_id', { mode: 'number' })
    .notNull()
    .references(() => serversSchema.serverId, { onDelete: 'cascade' }),
  channelId: bigint('channel_id', { mode: 'number' })
    .notNull()
    .references(() => channelsSchema.channelId, { onDelete: 'cascade' }),
  inviterId: bigint('inviter_id', { mode: 'number' }).notNull(),
  maxUses: integer('max_uses'),
  maxAge: integer('max_age'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  uses: integer('uses').default(0),
  isTemporary: boolean('is_temporary').default(false),
});

// export const organizationSchema = pgTable(
//   'organization',
//   {
//     id: text('id').primaryKey(),
//     stripeCustomerId: text('stripe_customer_id'),
//     stripeSubscriptionId: text('stripe_subscription_id'),
//     stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
//     stripeSubscriptionStatus: text('stripe_subscription_status'),
//     stripeSubscriptionCurrentPeriodEnd: bigint(
//       'stripe_subscription_current_period_end',
//       { mode: 'number' },
//     ),
//     updatedAt: timestamp('updated_at', { mode: 'date' })
//       .defaultNow()
//       .$onUpdate(() => new Date())
//       .notNull(),
//     createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
//   },
//   (table) => {
//     return {
//       stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
//         table.stripeCustomerId,
//       ),
//     };
//   },
// );

// export const todoSchema = pgTable('todo', {
//   id: serial('id').primaryKey(),
//   ownerId: text('owner_id').notNull(),
//   title: text('title').notNull(),
//   message: text('message').notNull(),
//   updatedAt: timestamp('updated_at', { mode: 'date' })
//     .defaultNow()
//     .$onUpdate(() => new Date())
//     .notNull(),
//   createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
// });

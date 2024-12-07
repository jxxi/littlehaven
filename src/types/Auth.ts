import type { EnumValues } from './Enum';

export const CIRCLE_ROLE = {
  ADMIN: 'circle:admin',
  MEMBER: 'circle:member',
  MOD: 'circle:moderator',
} as const;

export type CircleRole = EnumValues<typeof CIRCLE_ROLE>;

export const CIRCLE_PERMISSION = {
  // Add Circle Permissions here
} as const;

export type OrgPermission = EnumValues<typeof CIRCLE_PERMISSION>;

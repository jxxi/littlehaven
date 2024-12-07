/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { CirclePermission, CircleRole } from '@/types/Auth';

// Use type safe message keys with `next-intl`
type Messages = typeof import('../locales/en.json');
declare interface IntlMessages extends Messages {}

declare global {
  interface ClerkAuthorization {
    permission: CirclePermission;
    role: CircleRole;
  }
}

export {};

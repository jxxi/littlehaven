'use client';

import type { Channel } from './Channel';

export interface Circle {
  circleId: string;
  name: string;
  description?: string;
  icon?: string;
  channels: Channel[];
}

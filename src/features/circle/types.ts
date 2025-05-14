import type { Selectchannel, SelectCircle } from '@/models/Schema';

export interface Channel extends Selectchannel {
  lastMessageTimestamp: Date | null;
  lastReadTimestamp: Date | null;
}

export interface Circle extends SelectCircle {
  lastMessageTimestamp: Date | null;
  lastReadTimestamp: Date | null;
  channels: Channel[];
}

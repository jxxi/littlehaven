import logtail from '@logtail/pino';
import pino, { type DestinationStream } from 'pino';
import pretty from 'pino-pretty';

import { Env } from './Env';

let stream: DestinationStream;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (isBrowser) {
  // Client-side: use console-based logging
  stream = pretty({
    colorize: true,
  });
} else if (Env.LOGTAIL_SOURCE_TOKEN) {
  // Server-side with Logtail
  stream = pino.multistream([
    await logtail({
      sourceToken: Env.LOGTAIL_SOURCE_TOKEN,
      options: {
        sendLogsToBetterStack: true,
      },
    }),
    {
      stream: pretty(), // Prints logs to the console
    },
  ]);
} else {
  // Server-side without Logtail
  stream = pretty({
    colorize: true,
  });
}

export const logger = pino({ base: undefined }, stream);

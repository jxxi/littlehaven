import * as Sentry from '@sentry/nextjs';

export const logError = (message: string, error: any, context?: any) => {
  Sentry.captureException(error, {
    extra: {
      message,
      ...context,
    },
  });
};

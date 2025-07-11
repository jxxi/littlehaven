'use client';

import { ErrorBoundary } from '@sentry/nextjs';

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <ErrorBoundary fallback={<div>Something went wrong!</div>}>
      <div>
        <h2>Something went wrong!</h2>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </ErrorBoundary>
  );
}

/* eslint-disable no-console */
// Client-safe logger that doesn't access server environment variables
export const clientLogger = {
  info: (...args: any[]) => {
    if (typeof console !== 'undefined') {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (typeof console !== 'undefined') {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (typeof console !== 'undefined') {
      console.error(...args);
    }
  },
  debug: (...args: any[]) => {
    if (typeof console !== 'undefined') {
      console.debug(...args);
    }
  },
};

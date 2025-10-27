/**
 * Development-only logger utility
 * Prevents console statements from appearing in production builds
 */

import { isDev } from './env';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
};

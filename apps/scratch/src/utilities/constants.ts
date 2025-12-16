/* eslint-disable no-undef */

export const isDevelopment =
  (process.env.NEXT_PUBLIC_DEVELOPMENT as unknown as string | undefined) !==
  undefined;

export const sentryDsn = process.env.REACT_APP_SENTRY_DSN as unknown as string;

export const defaultMaximumExecutionTimeInMs = 1000 * 30;

export const isDevelopment =
  (process.env.NEXT_PUBLIC_DEVELOPMENT as unknown as string | undefined) !==
  undefined;

export const sentryDsn = process.env
  .NEXT_PUBLIC_SENTRY_DSN as unknown as string;

export const defaultMaximumExecutionTimeInMs = 1000 * 30;

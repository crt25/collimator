export const backendHostName = process.env
  .NEXT_PUBLIC_BACKEND_HOSTNAME as unknown as string;

export const scratchAppHostName = process.env
  .NEXT_PUBLIC_SCRATCH_APP_HOSTNAME as unknown as string;

export const openIdConnectMicrosoftServer = process.env
  .NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_SERVER as unknown as string;

export const openIdConnectMicrosoftClientId = process.env
  .NEXT_PUBLIC_OPEN_ID_CONNECT_MICROSOFT_CLIENT_ID as unknown as string;

export const sentryDsn = process.env
  .NEXT_PUBLIC_SENTRY_DSN as unknown as string;

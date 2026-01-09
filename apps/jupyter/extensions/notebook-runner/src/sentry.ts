import * as Sentry from "@sentry/browser";
import { VERSION } from "./version";

export const enableSentry = (): void => {
  // Check if running on localhost, i.e. in a development environment
  const isProductionEnvironment =
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  Sentry.init({
    dsn: "https://2b691a9ac828880dda066b5be1ae9873@o4508199129382912.ingest.de.sentry.io/4510680604016720",

    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Alternatively, use `process.env.npm_package_version` for a dynamic release version
    // if your build tool supports it.
    release: `crt-jupyter@${VERSION}`,
    enabled: isProductionEnvironment,
    environment: isProductionEnvironment ? "production" : "development",
  });
};

import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT === "prod" ? "production" : "development";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: sentryEnvironment,
  integrations: [
    // use Sentry.profiler.startProfiler(); and Sentry.profiler.stopProfiler(); to profile the code in between
    nodeProfilingIntegration(),
    Sentry.childProcessIntegration({ includeChildProcessArgs: true }),
    Sentry.prismaIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
});

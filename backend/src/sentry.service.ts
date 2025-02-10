import * as Sentry from "@sentry/nestjs";
import { BeforeApplicationShutdown, Injectable } from "@nestjs/common";

@Injectable()
export class SentryService implements BeforeApplicationShutdown {
  beforeApplicationShutdown(_signal?: string): Promise<boolean> {
    // Wait for Sentry to flush events before shutting down
    // https://docs.sentry.io/platforms/javascript/guides/nestjs/configuration/draining/
    return Sentry.close(1000 * 5);
  }
}

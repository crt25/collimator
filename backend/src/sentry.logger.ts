import { inspect } from "util";
import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";

type SentryLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * The application logger: Nest's ConsoleLogger, with every call additionally
 * forwarded to Sentry Logs (requires `enableLogs: true` in instrument.ts).
 * Console output is delegated to ConsoleLogger untouched, so formatting and
 * the LOG_LEVEL filtering behave exactly as before - but Sentry receives all
 * levels on purpose, regardless of what the console suppresses.
 */
export class SentryLogger extends ConsoleLogger {
  log(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("info", message, optionalParams);
    super.log(message, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("error", message, optionalParams);
    super.error(message, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("warn", message, optionalParams);
    super.warn(message, ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("debug", message, optionalParams);
    super.debug(message, ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("trace", message, optionalParams);
    super.verbose(message, ...optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.forwardToSentry("fatal", message, optionalParams);
    super.fatal(message, ...optionalParams);
  }

  private forwardToSentry(
    level: SentryLogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const attributes: Record<string, string> = {};
    const params = [...optionalParams];

    // Nest's Logger appends its context as the last parameter
    if (typeof params[params.length - 1] === "string") {
      attributes.context = params.pop() as string;
    }

    // error(message, stack, context): what remains is the stack trace
    const stack = params.find((param) => typeof param === "string");
    if (stack !== undefined) {
      attributes.stack = stack as string;
    }

    let text: string;
    if (typeof message === "string") {
      text = message;
    } else if (message instanceof Error) {
      text = message.message;
      if (message.stack !== undefined) {
        attributes.stack = message.stack;
      }
    } else {
      text = inspect(message);
    }

    Sentry.logger[level](text, attributes);
  }
}

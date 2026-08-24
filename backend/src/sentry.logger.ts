import { inspect } from "util";
import { ConsoleLogger, LogLevel } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";

type SentryLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// Nest log level -> Sentry Logs level. Nest's verbose is Sentry's trace and
// Nest's log is Sentry's info; the rest map by name.
const sentryLevelByLogLevel: Record<LogLevel, SentryLogLevel> = {
  verbose: "trace",
  debug: "debug",
  log: "info",
  warn: "warn",
  error: "error",
  fatal: "fatal",
};

/**
 * The application logger: Nest's ConsoleLogger, with every call additionally
 * forwarded to Sentry Logs (requires `enableLogs: true` in instrument.ts).
 * Console output is delegated to ConsoleLogger untouched, so formatting and
 * the LOG_LEVEL filtering behave exactly as before - but Sentry receives all
 * levels on purpose, regardless of what the console suppresses.
 *
 * The variadic parameters are classified into context and stack with the very
 * same helpers ConsoleLogger uses to decide what it prints, so what Sentry
 * shows always matches what the console prints.
 */
export class SentryLogger extends ConsoleLogger {
  /*
   * The public overloads below mirror ConsoleLogger's exactly, down to the
   * `any` parameters, so SentryLogger is a drop-in with the identical call
   * surface. `any` is required to match the base signatures (a subclass method
   * must be assignable to them), hence the scoped disable.
   */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  log(message: any, context?: string): void;
  log(message: any, ...optionalParams: [...any, string?]): void;
  log(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("log", [message, ...optionalParams]);
    super.log(message, ...optionalParams);
  }

  error(message: any, stackOrContext?: string): void;
  error(message: any, stack?: string, context?: string): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void;
  error(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("error", [message, ...optionalParams]);
    super.error(message, ...optionalParams);
  }

  warn(message: any, context?: string): void;
  warn(message: any, ...optionalParams: [...any, string?]): void;
  warn(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("warn", [message, ...optionalParams]);
    super.warn(message, ...optionalParams);
  }

  debug(message: any, context?: string): void;
  debug(message: any, ...optionalParams: [...any, string?]): void;
  debug(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("debug", [message, ...optionalParams]);
    super.debug(message, ...optionalParams);
  }

  verbose(message: any, context?: string): void;
  verbose(message: any, ...optionalParams: [...any, string?]): void;
  verbose(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("verbose", [message, ...optionalParams]);
    super.verbose(message, ...optionalParams);
  }

  fatal(message: any, context?: string): void;
  fatal(message: any, ...optionalParams: [...any, string?]): void;
  fatal(message: any, ...optionalParams: any[]): void {
    this.forwardToSentry("fatal", [message, ...optionalParams]);
    super.fatal(message, ...optionalParams);
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  private forwardToSentry(logLevel: LogLevel, args: unknown[]): void {
    const level = sentryLevelByLogLevel[logLevel];

    // Nest's error() is the only level whose parameters may carry a stack
    // trace; every other level classifies its parameters as context + messages.
    const classified =
      logLevel === "error"
        ? this.splitContextStackAndMessages(args)
        : this.splitContextAndMessages(args);

    const context = classified.context;
    const stack = "stack" in classified ? classified.stack : undefined;

    const attributes: Record<string, string> = {};
    if (typeof context === "string") {
      attributes.context = context;
    }
    if (typeof stack === "string") {
      attributes.stack = stack;
    }

    // ConsoleLogger prints each message separately, so we forward each one as
    // its own Sentry log entry to match.
    for (const currentMessage of classified.messages) {
      const messageAttributes = { ...attributes };

      let text: string;
      if (typeof currentMessage === "string") {
        text = currentMessage;
      } else if (currentMessage instanceof Error) {
        text = currentMessage.message;
        if (
          currentMessage.stack !== undefined &&
          messageAttributes.stack === undefined
        ) {
          messageAttributes.stack = currentMessage.stack;
        }
      } else {
        text = inspect(currentMessage);
      }

      Sentry.logger[level](text, messageAttributes);
    }
  }

  // ---------------------------------------------------------------------------
  // The three helpers below are copied verbatim from NestJS's ConsoleLogger so
  // that the context and stack we forward to Sentry are split exactly the way
  // the console splits them for printing (respectively its
  // getContextAndMessagesToPrint, getContextAndStackAndMessagesToPrint and
  // isStackFormat). They are renamed here only because those originals are
  // `private` members of the base class, which a subclass may not redeclare.
  //
  // Source: @nestjs/common v11.1.11,
  //   packages/common/services/console-logger.service.ts
  //   https://github.com/nestjs/nest/blob/master/packages/common/services/console-logger.service.ts
  // Copyright (c) Kamil Myśliwiec, licensed under the MIT License
  //   (https://github.com/nestjs/nest/blob/master/LICENSE).
  // Nest's isString/isUndefined helpers are inlined as typeof checks to keep
  // the copy free of @nestjs/common internal imports.
  //
  // FIXME: these are `private` in @nestjs/common v11.1.11; they are `protected`
  // on NestJS master. Once we upgrade to a release that exposes them, delete
  // these copies and call the inherited methods directly instead.
  // ---------------------------------------------------------------------------

  /** Copy of ConsoleLogger#getContextAndMessagesToPrint. */
  private splitContextAndMessages(args: unknown[]): {
    messages: unknown[];
    context?: string;
  } {
    if (args?.length <= 1) {
      return { messages: args, context: this.context };
    }
    const lastElement = args[args.length - 1];
    const isContext = typeof lastElement === "string";
    if (!isContext) {
      return { messages: args, context: this.context };
    }
    return {
      context: lastElement,
      messages: args.slice(0, args.length - 1),
    };
  }

  /** Copy of ConsoleLogger#getContextAndStackAndMessagesToPrint. */
  private splitContextStackAndMessages(args: unknown[]): {
    messages: unknown[];
    context?: string;
    stack?: string;
  } {
    if (args.length === 2) {
      return this.looksLikeStack(args[1])
        ? {
            messages: [args[0]],
            stack: args[1] as string,
            context: this.context,
          }
        : {
            messages: [args[0]],
            context: args[1] as string,
          };
    }

    const { messages, context } = this.splitContextAndMessages(args);
    if (messages?.length <= 1) {
      return { messages, context };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = typeof lastElement === "string";
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && lastElement !== undefined) {
      return { messages, context };
    }
    return {
      stack: lastElement as string,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

  /** Copy of ConsoleLogger#isStackFormat. */
  private looksLikeStack(stack: unknown): boolean {
    if (typeof stack !== "string" && stack !== undefined) {
      return false;
    }
    return /^(.)+\n\s+at .+:\d+:\d+/.test(stack as string);
  }
}

import { inspect } from "util";
import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";

type SentryLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

// duplicates ConsoleLogger's private isStackFormat regex
// (@nestjs/common/services/console-logger.service.js)
const stackFormat = /^(.)+\n\s+at .+:\d+:\d+/;

/**
 * The application logger: Nest's ConsoleLogger, with every call additionally
 * forwarded to Sentry Logs (requires `enableLogs: true` in instrument.ts).
 * Console output is delegated to ConsoleLogger untouched, so formatting and
 * the LOG_LEVEL filtering behave exactly as before - but Sentry receives all
 * levels on purpose, regardless of what the console suppresses.
 *
 * The variadic parameters are classified into context and stack exactly the
 * way ConsoleLogger classifies them for printing, so what Sentry shows always
 * matches what the console prints.
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

    // only Nest's error() maps to "error", and it is the only level whose
    // parameters may carry a stack trace: ConsoleLogger prints fatal() and
    // every other level through getContextAndMessagesToPrint, which treats
    // extra parameters as further messages, never as a stack
    const { context, stack } =
      level === "error"
        ? this.splitErrorParams(optionalParams)
        : this.splitParams(optionalParams);

    if (context !== undefined) {
      attributes.context = context;
    }
    if (stack !== undefined) {
      attributes.stack = stack;
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

  /**
   * The context is the trailing string parameter when there is one, and the
   * logger's own configured context otherwise - the classification of
   * ConsoleLogger.getContextAndMessagesToPrint.
   */
  private splitParams(optionalParams: unknown[]): {
    context?: string;
    stack?: string;
    rest: unknown[];
  } {
    const last = optionalParams[optionalParams.length - 1];

    if (typeof last !== "string") {
      return { context: this.context, rest: optionalParams };
    }

    return { context: last, rest: optionalParams.slice(0, -1) };
  }

  /**
   * Mirrors ConsoleLogger.getContextAndStackAndMessagesToPrint: a single
   * string parameter is the stack when it looks like one and the context
   * otherwise; with more parameters the trailing string is the context and
   * the last remaining parameter, if it is a string, the stack.
   */
  private splitErrorParams(optionalParams: unknown[]): {
    context?: string;
    stack?: string;
  } {
    if (optionalParams.length === 1) {
      const param = optionalParams[0];

      if (typeof param === "string" && stackFormat.test(param)) {
        return { context: this.context, stack: param };
      }

      return { context: typeof param === "string" ? param : this.context };
    }

    const { context, rest } = this.splitParams(optionalParams);
    const last = rest[rest.length - 1];

    return { context, stack: typeof last === "string" ? last : undefined };
  }
}

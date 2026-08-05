import { ConsoleLogger } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import { SentryLogger } from "../sentry.logger";

type SentryLogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

jest.mock("@sentry/nestjs", () => ({
  logger: {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

const sentryLogger = Sentry.logger as unknown as Record<
  SentryLogLevel,
  jest.Mock
>;

const nestMethods = [
  "log",
  "error",
  "warn",
  "debug",
  "verbose",
  "fatal",
] as const;

// The console output must stay exactly what ConsoleLogger produces, so the
// forwarding is asserted against a spied-on super call rather than stdout.
describe("SentryLogger", () => {
  let consoleSpies: Record<(typeof nestMethods)[number], jest.SpyInstance>;

  beforeEach(() => {
    consoleSpies = nestMethods.reduce(
      (spies, method) => {
        spies[method] = jest
          .spyOn(ConsoleLogger.prototype, method)
          .mockImplementation(() => undefined);
        return spies;
      },
      {} as Record<(typeof nestMethods)[number], jest.SpyInstance>,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it.each([
    ["log", "info"],
    ["warn", "warn"],
    ["error", "error"],
    ["debug", "debug"],
    ["verbose", "trace"],
    ["fatal", "fatal"],
  ] as const)(
    "forwards %s() to Sentry.logger.%s and still logs to the console",
    (nestMethod, sentryMethod) => {
      const logger = new SentryLogger();

      logger[nestMethod]("something happened", "SomeContext");

      expect(sentryLogger[sentryMethod]).toHaveBeenCalledWith(
        "something happened",
        { context: "SomeContext" },
      );
      expect(consoleSpies[nestMethod]).toHaveBeenCalledWith(
        "something happened",
        "SomeContext",
      );
    },
  );

  it("forwards levels to Sentry even when the console suppresses them", () => {
    // let the real ConsoleLogger.log run so its level filter actually applies
    consoleSpies.log.mockRestore();
    const stdoutSpy = jest
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    const stderrSpy = jest
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);

    const logger = new SentryLogger({ logLevels: ["error"] });

    logger.log("suppressed on the console", "SomeContext");

    expect(sentryLogger.info).toHaveBeenCalledWith(
      "suppressed on the console",
      {
        context: "SomeContext",
      },
    );
    expect(stdoutSpy).not.toHaveBeenCalled();
    expect(stderrSpy).not.toHaveBeenCalled();
  });

  it("attaches the stack trace passed to error()", () => {
    const logger = new SentryLogger();

    logger.error("it broke", "Error: it broke\n  at somewhere", "SomeContext");

    expect(sentryLogger.error).toHaveBeenCalledWith("it broke", {
      context: "SomeContext",
      stack: "Error: it broke\n  at somewhere",
    });
  });

  it("attaches the stack of the two-argument error() form", () => {
    const logger = new SentryLogger();
    const stack =
      "Error: kaboom\n    at Object.<anonymous> (/app/src/x.ts:10:15)";

    logger.error("kaboom happened", stack);

    expect(sentryLogger.error).toHaveBeenCalledWith("kaboom happened", {
      stack,
    });
  });

  it("treats a non-stack second argument to error() as the context", () => {
    const logger = new SentryLogger();

    logger.error("it broke", "SomeContext");

    expect(sentryLogger.error).toHaveBeenCalledWith("it broke", {
      context: "SomeContext",
    });
  });

  it("takes the last remaining string as the stack of a longer error() call", () => {
    const logger = new SentryLogger();

    logger.error("it broke", "a", "b", "Ctx");

    expect(sentryLogger.error).toHaveBeenCalledWith("it broke", {
      context: "Ctx",
      stack: "b",
    });
  });

  it("never attaches a stack for non-error levels", () => {
    const logger = new SentryLogger();

    logger.log("something happened", "extra", "SomeContext");

    expect(sentryLogger.info).toHaveBeenCalledWith("something happened", {
      context: "SomeContext",
    });
  });

  it("falls back to the logger's configured context", () => {
    const logger = new SentryLogger("MyService");

    logger.log("hello");

    expect(sentryLogger.info).toHaveBeenCalledWith("hello", {
      context: "MyService",
    });
  });

  it("prefers an explicit context over the configured one", () => {
    const logger = new SentryLogger("MyService");

    logger.log("hello", "OtherContext");

    expect(sentryLogger.info).toHaveBeenCalledWith("hello", {
      context: "OtherContext",
    });
  });

  it("uses an Error's message and stack when one is logged", () => {
    const logger = new SentryLogger();
    const error = new Error("kaboom");

    logger.error(error, "SomeContext");

    expect(sentryLogger.error).toHaveBeenCalledWith("kaboom", {
      context: "SomeContext",
      stack: error.stack,
    });
  });

  it("stringifies non-string messages", () => {
    const logger = new SentryLogger();

    logger.log({ code: 42 }, "SomeContext");

    expect(sentryLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("42"),
      { context: "SomeContext" },
    );
  });

  it("forwards a message logged without a context", () => {
    const logger = new SentryLogger();

    logger.log("no context here");

    expect(sentryLogger.info).toHaveBeenCalledWith("no context here", {});
  });
});

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

// The console output must stay exactly what ConsoleLogger produces, so the
// forwarding is asserted against a spied-on super call rather than stdout.
describe("SentryLogger", () => {
  const consoleSpies = (
    ["log", "error", "warn", "debug", "verbose", "fatal"] as const
  ).reduce(
    (spies, method) => {
      spies[method] = jest
        .spyOn(ConsoleLogger.prototype, method)
        .mockImplementation(() => undefined);
      return spies;
    },
    {} as Record<string, jest.SpyInstance>,
  );

  afterEach(() => jest.clearAllMocks());
  afterAll(() => jest.restoreAllMocks());

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
        expect.objectContaining({ context: "SomeContext" }),
      );
      expect(consoleSpies[nestMethod]).toHaveBeenCalledWith(
        "something happened",
        "SomeContext",
      );
    },
  );

  it("forwards levels to Sentry even when the console suppresses them", () => {
    const logger = new SentryLogger({ logLevels: ["error"] });

    logger.log("suppressed on the console", "SomeContext");

    expect(sentryLogger.info).toHaveBeenCalledWith(
      "suppressed on the console",
      expect.objectContaining({ context: "SomeContext" }),
    );
  });

  it("attaches the stack trace passed to error()", () => {
    const logger = new SentryLogger();

    logger.error("it broke", "Error: it broke\n  at somewhere", "SomeContext");

    expect(sentryLogger.error).toHaveBeenCalledWith(
      "it broke",
      expect.objectContaining({
        context: "SomeContext",
        stack: "Error: it broke\n  at somewhere",
      }),
    );
  });

  it("uses an Error's message and stack when one is logged", () => {
    const logger = new SentryLogger();
    const error = new Error("kaboom");

    logger.error(error, "SomeContext");

    expect(sentryLogger.error).toHaveBeenCalledWith(
      "kaboom",
      expect.objectContaining({
        context: "SomeContext",
        stack: error.stack,
      }),
    );
  });

  it("stringifies non-string messages", () => {
    const logger = new SentryLogger();

    logger.log({ code: 42 }, "SomeContext");

    expect(sentryLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("42"),
      expect.objectContaining({ context: "SomeContext" }),
    );
  });

  it("forwards a message logged without a context", () => {
    const logger = new SentryLogger();

    logger.log("no context here");

    expect(sentryLogger.info).toHaveBeenCalledWith("no context here", {});
  });
});

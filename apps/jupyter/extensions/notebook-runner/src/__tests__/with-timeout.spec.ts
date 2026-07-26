import { withTimeout } from "../utils";

describe("withTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves with the value when the promise settles in time", async () => {
    const buildTimeoutError = jest.fn(() => new Error("too slow"));

    await expect(
      withTimeout(Promise.resolve("done"), 1000, buildTimeoutError),
    ).resolves.toBe("done");

    expect(buildTimeoutError).not.toHaveBeenCalled();
  });

  it("propagates the original rejection", async () => {
    const failure = new Error("boom");

    await expect(
      withTimeout(Promise.reject(failure), 1000, () => new Error("too slow")),
    ).rejects.toBe(failure);
  });

  it("rejects with the built error once the timeout elapses", async () => {
    const timeoutError = new Error("too slow");

    const result = withTimeout(
      new Promise<never>(() => {}),
      1000,
      () => timeoutError,
    );

    jest.advanceTimersByTime(1000);

    await expect(result).rejects.toBe(timeoutError);
  });

  it("clears the timer once the promise settles", async () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

    await withTimeout(Promise.resolve("done"), 1000, () => new Error("nope"));

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });
});

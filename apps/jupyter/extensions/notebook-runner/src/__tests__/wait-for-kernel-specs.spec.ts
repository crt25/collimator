import {
  KernelSpecWaitTarget,
  waitForKernelSpecs,
} from "../kernel/wait-for-kernel-specs";

type SpecsChangedCallback = (
  sender: unknown,
  specs: KernelSpecWaitTarget["specs"],
) => void;

const pyodideSpecs = {
  default: "python",
  kernelspecs: {
    python: {
      name: "python",
      language: "python",
      display_name: "Python (Pyodide)",
      argv: [],
      resources: {},
    },
  },
} as unknown as Exclude<KernelSpecWaitTarget["specs"], null>;

const createManager = (
  initialSpecs: KernelSpecWaitTarget["specs"],
  ready: Promise<void> = Promise.resolve(),
): {
  manager: KernelSpecWaitTarget;
  emitSpecs: (specs: KernelSpecWaitTarget["specs"]) => void;
  connected: () => number;
} => {
  const callbacks = new Set<SpecsChangedCallback>();

  const manager = {
    ready,
    specs: initialSpecs,
    specsChanged: {
      connect: (callback: SpecsChangedCallback): boolean => {
        callbacks.add(callback);
        return true;
      },
      disconnect: (callback: SpecsChangedCallback): boolean => {
        callbacks.delete(callback);
        return true;
      },
    },
  };

  return {
    manager,
    // like the real manager: the specs property updates, then the signal fires
    emitSpecs: (emitted): void => {
      manager.specs = emitted;
      for (const callback of [...callbacks]) {
        callback(manager, emitted);
      }
    },
    connected: () => callbacks.size,
  };
};

describe("waitForKernelSpecs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("resolves immediately when a kernelspec is already registered", async () => {
    const { manager, connected } = createManager(pyodideSpecs);

    await waitForKernelSpecs(manager);

    expect(connected()).toBe(0);
  });

  it("resolves once a kernelspec is registered later", async () => {
    const { manager, emitSpecs, connected } = createManager(null);

    const wait = waitForKernelSpecs(manager);

    let resolved = false;
    void wait.then(() => {
      resolved = true;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(false);

    emitSpecs(pyodideSpecs);
    await wait;

    expect(connected()).toBe(0);
  });

  it("ignores emissions that still contain no spec", async () => {
    const { manager, emitSpecs } = createManager(null);

    const wait = waitForKernelSpecs(manager);

    emitSpecs({
      default: "python",
      kernelspecs: {},
    } as unknown as KernelSpecWaitTarget["specs"]);

    let resolved = false;
    void wait.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(resolved).toBe(false);

    emitSpecs(pyodideSpecs);
    await wait;
  });

  it("gives up after the bounded wait so the notebook still opens", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const { manager, connected } = createManager(null);

    const wait = waitForKernelSpecs(manager, 1_000);

    await jest.advanceTimersByTimeAsync(1_000);
    await wait;

    expect(connected()).toBe(0);
    expect(console.warn).toHaveBeenCalled();
  });

  it("does not miss a spec registered before the wait could subscribe", async () => {
    // the manager's mutable specs may be populated before the helper has a
    // chance to connect to the signal; the specs re-checks cover it
    const { manager, emitSpecs, connected } = createManager(null);

    const wait = waitForKernelSpecs(manager);
    emitSpecs(pyodideSpecs);

    await wait;

    expect(connected()).toBe(0);
  });

  it("falls back through the timeout when readiness rejects", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    const { manager, connected } = createManager(
      null,
      Promise.reject(new Error("kernelspec manager failed")),
    );

    const wait = waitForKernelSpecs(manager, 1_000);

    await jest.advanceTimersByTimeAsync(1_000);
    await wait;

    expect(connected()).toBe(0);
    expect(console.warn).toHaveBeenCalled();
  });

  it("still gives up when the manager never becomes ready", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    // a readiness promise that never settles must not hang the caller
    const { manager, connected } = createManager(
      null,
      new Promise<void>(() => {}),
    );

    const wait = waitForKernelSpecs(manager, 1_000);

    await jest.advanceTimersByTimeAsync(1_000);
    await wait;

    expect(connected()).toBe(0);
    expect(console.warn).toHaveBeenCalled();
  });

  it("resolves on a late spec even after readiness rejected", async () => {
    const { manager, emitSpecs, connected } = createManager(
      null,
      Promise.reject(new Error("kernelspec manager failed")),
    );

    const wait = waitForKernelSpecs(manager);
    emitSpecs(pyodideSpecs);

    await wait;

    expect(connected()).toBe(0);
  });
});

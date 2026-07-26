import { KernelSpec } from "@jupyterlab/services";
import { kernelSpecWaitTimeoutMs, waitForKernelSpecs } from "../kernel-specs";

type SpecsChangedListener = (
  sender: unknown,
  specs: KernelSpec.ISpecModels | null,
) => void;

const buildSpecs = (names: string[]): KernelSpec.ISpecModels =>
  ({
    default: names[0] ?? "",
    kernelspecs: Object.fromEntries(names.map((name) => [name, { name }])),
  }) as unknown as KernelSpec.ISpecModels;

/**
 * Stands in for JupyterLite's KernelSpecs manager, whose `specs` getter returns
 * null until the first kernelspec is registered.
 */
const createKernelSpecsManager = (): {
  manager: KernelSpec.IManager;
  register: (names: string[]) => void;
  listenerCount: () => number;
} => {
  const listeners = new Set<SpecsChangedListener>();
  let specs: KernelSpec.ISpecModels | null = null;

  const manager = {
    ready: Promise.resolve(),
    get specs(): KernelSpec.ISpecModels | null {
      return specs;
    },
    specsChanged: {
      connect: (listener: SpecsChangedListener): Set<SpecsChangedListener> =>
        listeners.add(listener),
      disconnect: (listener: SpecsChangedListener): boolean =>
        listeners.delete(listener),
    },
  } as unknown as KernelSpec.IManager;

  return {
    manager,
    register: (names): void => {
      specs = buildSpecs(names);
      for (const listener of [...listeners]) {
        listener(manager, specs);
      }
    },
    listenerCount: () => listeners.size,
  };
};

describe("waitForKernelSpecs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves immediately when a kernelspec is already registered", async () => {
    const { manager, register, listenerCount } = createKernelSpecsManager();
    register(["python"]);

    await expect(waitForKernelSpecs(manager)).resolves.toBeUndefined();
    expect(listenerCount()).toBe(0);
  });

  it("resolves once a kernelspec is registered later", async () => {
    const { manager, register, listenerCount } = createKernelSpecsManager();

    let resolved = false;
    const wait = waitForKernelSpecs(manager).then(() => {
      resolved = true;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    register(["python"]);
    await wait;

    expect(resolved).toBe(true);
    expect(listenerCount()).toBe(0);
  });

  it("gives up after the timeout instead of waiting forever", async () => {
    const { manager, listenerCount } = createKernelSpecsManager();
    jest.spyOn(console, "warn").mockImplementation(() => {});

    const wait = waitForKernelSpecs(manager);

    // let the awaited `ready` promise settle before advancing the clock
    await Promise.resolve();
    jest.advanceTimersByTime(kernelSpecWaitTimeoutMs);

    await expect(wait).resolves.toBeUndefined();
    expect(listenerCount()).toBe(0);
  });
});

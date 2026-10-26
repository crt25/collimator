import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { SessionContext } from "@jupyterlab/apputils";
import { NotebookRunnerState } from "../notebook-runner-state";
import { OtterKernelPreparationError } from "../errors/otter-errors";
import { PythonExecutionError } from "../errors/kernel-errors";
import { installNbConvert, installOtter } from "../packages";

type Slot = (sender: unknown, args: unknown) => void;

interface MockKernel {
  id: string;
  name: string;
  info: Promise<unknown>;
  registerCommTarget: jest.Mock;
  requestExecute: jest.Mock;
}

interface MockSignal {
  connect(slot: Slot): boolean;
  disconnect(slot: Slot): boolean;
  emit(args: unknown): void;
  slots: Set<Slot>;
}

interface MockSessionContextInstance {
  kernelChanged: MockSignal;
  isDisposed: boolean;
  options: { kernelPreference?: { shutdownOnDispose?: boolean } };
  session: { kernel: MockKernel } | null;
  initialize(): Promise<boolean>;
  restartKernel(): Promise<void>;
}

type MockSessionContextClass = {
  instances: MockSessionContextInstance[];
  prototype: MockSessionContextInstance;
  createKernel(id: string): MockKernel;
};

// installing the packages is not what is tested here
jest.mock("../packages", () => ({
  installOtter: jest.fn(),
  installNbConvert: jest.fn(),
}));

// A minimal stand-in for the session context that creates a new kernel on
// every initialization, just like a freshly created session would.
jest.mock("@jupyterlab/apputils", () => {
  const createSignal = (): MockSignal => {
    const slots = new Set<Slot>();

    return {
      slots,
      connect: (slot): boolean => {
        slots.add(slot);
        return true;
      },
      disconnect: (slot): boolean => {
        slots.delete(slot);
        return true;
      },
      emit: (args): void => {
        for (const slot of [...slots]) {
          slot(undefined, args);
        }
      },
    };
  };

  class MockSessionContext implements MockSessionContextInstance {
    static instances: MockSessionContextInstance[] = [];

    static createKernel(id: string): MockKernel {
      return {
        id,
        name: "python",
        info: Promise.resolve({}),
        registerCommTarget: jest.fn(),
        requestExecute: jest.fn(() => ({
          done: Promise.resolve({ content: { status: "ok" } }),
        })),
      };
    }

    readonly kernelChanged = createSignal();
    readonly disposed = createSignal();
    readonly ready = Promise.resolve();

    isDisposed = false;
    session: { kernel: MockKernel } | null = null;

    constructor(readonly options: MockSessionContextInstance["options"] = {}) {
      MockSessionContext.instances.push(this);
    }

    async initialize(): Promise<boolean> {
      // take a macrotask like the real thing so that the tests can never
      // starve the event loop, even if the code under test retries forever
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      this.session = {
        kernel: MockSessionContext.createKernel(
          `kernel-${MockSessionContext.instances.length}`,
        ),
      };

      return false;
    }

    // like the real thing, a restart signals the same kernel connection again
    async restartKernel(): Promise<void> {
      this.kernelChanged.emit({
        oldValue: this.session?.kernel,
        newValue: this.session?.kernel,
      });
    }

    dispose(): void {
      this.isDisposed = true;
      this.disposed.emit(undefined);
    }
  }

  return { SessionContext: MockSessionContext };
});

const packagingConflict = new PythonExecutionError(
  "ValueError",
  "Requested 'packaging>=25.0', but packaging==24.2 is already installed.",
);

// e.g. a download that failed
const temporaryFailure = new Error("Failed to fetch");

const waitForSlots = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

const mockedInstallOtter = installOtter as jest.Mock;
const mockedInstallNbConvert = installNbConvert as jest.Mock;
const MockedSessionContext =
  SessionContext as unknown as MockSessionContextClass;

const createState = (): NotebookRunnerState =>
  new NotebookRunnerState(
    { serviceManager: { sessions: {}, kernelspecs: {} } } as JupyterFrontEnd,
    {} as IDocumentManager,
    {} as INotebookTracker,
  );

describe("NotebookRunnerState", () => {
  beforeEach(() => {
    MockedSessionContext.instances = [];
    mockedInstallOtter.mockReset().mockResolvedValue(undefined);
    mockedInstallNbConvert.mockReset().mockResolvedValue(undefined);

    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("provides the kernel once Otter is installed", async () => {
    const state = createState();

    const kernel = await state.getOtterKernel();

    expect(kernel).toBe(MockedSessionContext.instances[0].session?.kernel);
    expect(mockedInstallOtter).toHaveBeenCalledTimes(1);
  });

  it("retries the preparation if it fails temporarily", async () => {
    mockedInstallOtter.mockRejectedValueOnce(temporaryFailure);

    const state = createState();

    const kernel = await state.getOtterKernel();

    expect(MockedSessionContext.instances).toHaveLength(1);
    expect(mockedInstallOtter).toHaveBeenCalledTimes(2);
    expect(kernel).toBe(MockedSessionContext.instances[0].session?.kernel);
  });

  it("retries with a fresh session if the session cannot be initialized", async () => {
    jest
      .spyOn(MockedSessionContext.prototype, "initialize")
      .mockRejectedValueOnce(new Error("no kernel"));

    const state = createState();

    const kernel = await state.getOtterKernel();

    expect(MockedSessionContext.instances).toHaveLength(2);
    expect(MockedSessionContext.instances[0].isDisposed).toBe(true);
    expect(kernel).toBe(MockedSessionContext.instances[1].session?.kernel);
  });

  it("shuts the kernel of a disposed session down", async () => {
    await createState().getOtterKernel();

    expect(
      MockedSessionContext.instances[0].options.kernelPreference
        ?.shutdownOnDispose,
    ).toBe(true);
  });

  it("gives up right away if the preparation would fail again", async () => {
    mockedInstallOtter.mockRejectedValue(packagingConflict);

    const state = createState();

    const error = await state.getOtterKernel().catch((e) => e);

    expect(error).toBeInstanceOf(OtterKernelPreparationError);
    expect(error.message).toContain(
      "Requested 'packaging>=25.0', but packaging==24.2 is already installed",
    );
    expect(error.cause).toBe(packagingConflict);
    expect(error.attempts).toBe(1);

    expect(mockedInstallOtter).toHaveBeenCalledTimes(1);
    expect(MockedSessionContext.instances).toHaveLength(1);
    expect(MockedSessionContext.instances[0].isDisposed).toBe(true);

    // the failure is permanent: asking again fails right away
    await expect(state.getOtterKernel()).rejects.toBe(error);
  });

  it("rejects instead of hanging if the preparation keeps failing", async () => {
    mockedInstallOtter.mockRejectedValue(temporaryFailure);

    const state = createState();

    const error = await state.getOtterKernel().catch((e) => e);

    expect(error).toBeInstanceOf(OtterKernelPreparationError);
    expect(error.cause).toBe(temporaryFailure);

    // gave up after a bounded number of attempts and cleaned up
    expect(error.attempts).toBeGreaterThan(1);
    expect(mockedInstallOtter).toHaveBeenCalledTimes(error.attempts);
    expect(
      MockedSessionContext.instances.every((context) => context.isDisposed),
    ).toBe(true);
  });

  it("does not need anyone to be waiting when the preparation fails", async () => {
    mockedInstallOtter.mockRejectedValue(packagingConflict);

    const state = createState();

    // nobody has asked for the kernel while it failed to be prepared
    await new Promise((resolve) => setTimeout(resolve, 50));

    await expect(state.getOtterKernel()).rejects.toBeInstanceOf(
      OtterKernelPreparationError,
    );
  });

  describe("after the kernel was replaced", () => {
    const replaceKernel = async (
      state: NotebookRunnerState,
    ): Promise<MockKernel> => {
      await state.getOtterKernel();

      const context = MockedSessionContext.instances[0];
      const replacement = MockedSessionContext.createKernel("replacement");
      context.session = { kernel: replacement };

      // the session context signals a new kernel
      const slots = [...context.kernelChanged.slots];
      expect(slots).toHaveLength(1);
      const result: unknown = slots[0](context, { newValue: replacement });

      // signals ignore the result of their slots, so a rejection would never be handled
      expect(result).toBeUndefined();

      await waitForSlots();

      return replacement;
    };

    it("rejects with the same error as the initial kernel if it cannot be prepared", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValue(packagingConflict);
      const state = createState();

      await replaceKernel(state);

      const error = await state.getOtterKernel().catch((e) => e);
      expect(error).toBeInstanceOf(OtterKernelPreparationError);
      expect(error.cause).toBe(packagingConflict);
    });

    it("retries the preparation if it fails temporarily", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(temporaryFailure);
      const state = createState();

      const replacement = await replaceKernel(state);

      await expect(state.getOtterKernel()).resolves.toBe(replacement);
      expect(mockedInstallOtter).toHaveBeenCalledTimes(3);
    });
  });

  describe("after the kernel was restarted", () => {
    it("does not provide the kernel if it could not be prepared again", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValue(packagingConflict);
      const state = createState();

      await state.getOtterKernel();

      await state.restartOtterKernel();
      await waitForSlots();

      await expect(state.getOtterKernel()).rejects.toBeInstanceOf(
        OtterKernelPreparationError,
      );
    });

    it("recovers once a later restart can be prepared", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(packagingConflict);
      const state = createState();

      await state.getOtterKernel();

      await state.restartOtterKernel();
      await waitForSlots();
      await expect(state.getOtterKernel()).rejects.toBeInstanceOf(
        OtterKernelPreparationError,
      );

      await state.restartOtterKernel();
      await waitForSlots();
      await expect(state.getOtterKernel()).resolves.toBe(
        MockedSessionContext.instances[0].session?.kernel,
      );
    });
  });
});

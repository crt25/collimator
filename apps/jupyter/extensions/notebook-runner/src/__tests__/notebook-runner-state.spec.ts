import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import {
  IKernelConnection,
  Status,
} from "@jupyterlab/services/lib/kernel/kernel";
import { NotebookRunnerState } from "../notebook-runner-state";
import { OtterKernelPreparationError } from "../errors/otter-errors";
import { PythonExecutionError } from "../errors/kernel-errors";
import { installOtter } from "../packages";
import {
  createMockKernel,
  flushMacrotask,
  KernelChangedArgs,
  MockSignal,
} from "./helpers/kernel";
import { expectError } from "./helpers/common";

interface MockSessionContextInstance {
  kernelChanged: MockSignal<MockSessionContextInstance, KernelChangedArgs>;
  statusChanged: MockSignal<MockSessionContextInstance, Status>;
  disposed: MockSignal<MockSessionContextInstance, void>;
  isDisposed: boolean;
  options: { kernelPreference?: { shutdownOnDispose?: boolean } };
  session: { kernel: IKernelConnection } | null;
  initialize(): Promise<boolean>;
  restartKernel(): Promise<void>;
}

type MockSessionContextClass = {
  instances: MockSessionContextInstance[];
  prototype: MockSessionContextInstance;
};

// installing the packages is not what is tested here
jest.mock("../packages", () => ({
  installOtter: jest.fn(),
  installNbConvert: jest.fn(),
}));

// A minimal stand-in for the session context that creates a new kernel on
// every initialization, just like a freshly created session would.
jest.mock("@jupyterlab/apputils", () => {
  const helpers =
    jest.requireActual<typeof import("./helpers/kernel")>("./helpers/kernel");

  class MockSessionContext implements MockSessionContextInstance {
    static instances: MockSessionContextInstance[] = [];

    readonly kernelChanged: MockSessionContextInstance["kernelChanged"] =
      helpers.createMockSignal(this as MockSessionContextInstance);
    readonly statusChanged: MockSessionContextInstance["statusChanged"] =
      helpers.createMockSignal(this as MockSessionContextInstance);
    readonly disposed: MockSessionContextInstance["disposed"] =
      helpers.createMockSignal(this as MockSessionContextInstance);
    readonly ready = Promise.resolve();

    isDisposed = false;
    session: { kernel: IKernelConnection } | null = null;

    constructor(readonly options: MockSessionContextInstance["options"] = {}) {
      MockSessionContext.instances.push(this);
    }

    async initialize(): Promise<boolean> {
      // take a macrotask like the real thing so that the tests can never
      // starve the event loop, even if the code under test retries forever
      await helpers.flushMacrotask();

      this.session = {
        kernel: helpers.createMockKernel(
          `kernel-${MockSessionContext.instances.length}`,
        ),
      };

      return false;
    }

    // like the real thing, a restart signals the same kernel connection again
    // once it is done
    async restartKernel(): Promise<void> {
      this.statusChanged.emit("restarting");
      await helpers.flushMacrotask();

      const kernel = this.session?.kernel ?? null;
      this.kernelChanged.emit({
        name: "kernel",
        oldValue: kernel,
        newValue: kernel,
      });
    }

    dispose(): void {
      this.isDisposed = true;
      this.disposed.emit();
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

const mockedInstallOtter = jest.mocked(installOtter);
const { SessionContext: MockedSessionContext } = jest.requireMock<{
  SessionContext: MockSessionContextClass;
}>("@jupyterlab/apputils");

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

    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("provides the kernel once Otter is installed", async () => {
    const state = createState();

    const kernel = await state.getOtterKernel();

    expect(kernel).toBe(MockedSessionContext.instances[0].session?.kernel);
    expect(mockedInstallOtter).toHaveBeenCalledTimes(1);
  });

  describe("if the session cannot be initialized", () => {
    const noKernel = new Error("no kernel");

    beforeEach(() => {
      // skip the delay between the attempts
      jest.useFakeTimers();
    });

    it("retries with a fresh session", async () => {
      jest
        .spyOn(MockedSessionContext.prototype, "initialize")
        .mockRejectedValueOnce(noKernel);

      const state = createState();

      const kernel = state.getOtterKernel();
      await jest.runAllTimersAsync();

      expect(MockedSessionContext.instances).toHaveLength(2);
      expect(MockedSessionContext.instances[0].isDisposed).toBe(true);
      await expect(kernel).resolves.toBe(
        MockedSessionContext.instances[1].session?.kernel,
      );
    });

    it("gives up if it can never be initialized", async () => {
      jest
        .spyOn(MockedSessionContext.prototype, "initialize")
        .mockRejectedValue(noKernel);

      const state = createState();

      const rejection = expectError(
        () => state.getOtterKernel(),
        OtterKernelPreparationError,
      );
      await jest.runAllTimersAsync();

      const error = await rejection;
      expect(error.cause).toBe(noKernel);
      expect(error.attempts).toBe(MockedSessionContext.instances.length);
      expect(MockedSessionContext.instances.length).toBeGreaterThan(1);
      expect(
        MockedSessionContext.instances.every((context) => context.isDisposed),
      ).toBe(true);
    });

    it("counts the failed sessions if the preparation fails afterwards", async () => {
      jest
        .spyOn(MockedSessionContext.prototype, "initialize")
        .mockRejectedValueOnce(noKernel);
      mockedInstallOtter.mockRejectedValue(packagingConflict);

      const state = createState();

      const rejection = expectError(
        () => state.getOtterKernel(),
        OtterKernelPreparationError,
      );
      await jest.runAllTimersAsync();

      const error = await rejection;
      expect(error.cause).toBe(packagingConflict);
      expect(error.attempts).toBe(2);
    });
  });

  it("creates the session so that disposing it shuts its kernel down", async () => {
    await createState().getOtterKernel();

    expect(
      MockedSessionContext.instances[0].options.kernelPreference
        ?.shutdownOnDispose,
    ).toBe(true);
  });

  it.each([
    ["a Python exception", packagingConflict],
    ["a temporary failure", temporaryFailure],
  ])(
    "gives up without retrying if the preparation fails with %s",
    async (_, cause) => {
      mockedInstallOtter.mockRejectedValue(cause);

      const state = createState();

      const error = await expectError(
        () => state.getOtterKernel(),
        OtterKernelPreparationError,
      );
      expect(error.message).toContain(cause.message);
      expect(error.cause).toBe(cause);
      expect(error.attempts).toBe(1);

      expect(mockedInstallOtter).toHaveBeenCalledTimes(1);
      expect(MockedSessionContext.instances).toHaveLength(1);
      expect(MockedSessionContext.instances[0].isDisposed).toBe(true);

      // the failure is permanent: asking again fails right away
      await expect(state.getOtterKernel()).rejects.toBe(error);
    },
  );

  it("does not need anyone to be waiting when the preparation fails", async () => {
    mockedInstallOtter.mockRejectedValue(packagingConflict);

    const state = createState();

    // nobody has asked for the kernel while it failed to be prepared, which
    // disposes the session
    await new Promise<void>((resolve) =>
      MockedSessionContext.instances[0].disposed.connect(() => resolve()),
    );
    await flushMacrotask();

    await expect(state.getOtterKernel()).rejects.toBeInstanceOf(
      OtterKernelPreparationError,
    );
  });

  describe("after the kernel was replaced", () => {
    const replaceKernel = async (
      state: NotebookRunnerState,
    ): Promise<IKernelConnection> => {
      await state.getOtterKernel();

      const context = MockedSessionContext.instances[0];
      const replacement = createMockKernel("replacement");
      context.session = { kernel: replacement };

      context.kernelChanged.emit({
        name: "kernel",
        oldValue: null,
        newValue: replacement,
      });

      await flushMacrotask();

      return replacement;
    };

    it("rejects with the same error as the initial kernel if it cannot be prepared", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValue(packagingConflict);
      const state = createState();

      await replaceKernel(state);

      const error = await expectError(
        () => state.getOtterKernel(),
        OtterKernelPreparationError,
      );
      expect(error.cause).toBe(packagingConflict);
    });

    it("provides the replacement once it is prepared", async () => {
      const state = createState();

      const replacement = await replaceKernel(state);

      await expect(state.getOtterKernel()).resolves.toBe(replacement);
    });
  });

  describe("after the kernel was restarted", () => {
    const restart = async (state: NotebookRunnerState): Promise<void> => {
      await state.restartOtterKernel();
      await flushMacrotask();
    };

    it("does not provide the kernel while it is being restarted", async () => {
      const state = createState();
      await state.getOtterKernel();

      let restarted = false;
      const restarting = state.restartOtterKernel().then(() => {
        restarted = true;
      });

      // asked for while the restart is still in progress
      const kernel = state.getOtterKernel().then((kernel) => {
        expect(restarted).toBe(true);
        return kernel;
      });

      await restarting;
      await expect(kernel).resolves.toBe(
        MockedSessionContext.instances[0].session?.kernel,
      );
      expect(mockedInstallOtter).toHaveBeenCalledTimes(2);
    });

    it("does not provide the kernel until a restart can be prepared again", async () => {
      mockedInstallOtter
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(packagingConflict);
      const state = createState();

      await state.getOtterKernel();

      await restart(state);
      await expect(state.getOtterKernel()).rejects.toBeInstanceOf(
        OtterKernelPreparationError,
      );

      await restart(state);
      await expect(state.getOtterKernel()).resolves.toBe(
        MockedSessionContext.instances[0].session?.kernel,
      );
    });
  });
});

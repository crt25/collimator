import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { executePythonInKernel, setupKernel } from "../utils";
import { PythonExecutionError } from "../errors/kernel-errors";
import { waitForKernelToBePrepared } from "../kernel/kernel-preparation";
import {
  createMockKernel,
  createMockSessionContext,
  flushMacrotask,
  MockSessionContext,
} from "./helpers/kernel";
import { expectError } from "./helpers/common";

describe("executePythonInKernel", () => {
  it("rejects with the Python exception that was raised", async () => {
    const kernel = createMockKernel("kernel", {
      status: "error",
      ename: "ValueError",
      evalue: "Requested 'packaging>=25.0'",
    });

    const error = await expectError(
      () => executePythonInKernel({ kernel, code: "" }),
      PythonExecutionError,
    );

    expect(error.ename).toBe("ValueError");
    expect(error.message).toBe(
      "Error executing code: ValueError: Requested 'packaging>=25.0'",
    );
  });
});

describe("setupKernel", () => {
  const setupFailed = new Error("setup failed");

  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("marks the kernel as prepared once the setup succeeds", async () => {
    const kernel = createMockKernel();
    const { sessionContext } = createMockSessionContext(kernel);
    const waiting = waitForKernelToBePrepared(kernel);

    await setupKernel(sessionContext, () => Promise.resolve());

    await expect(waiting).resolves.toBeUndefined();
  });

  it("rejects and lets those waiting for the kernel fail if the initial setup fails", async () => {
    const kernel = createMockKernel();
    const { sessionContext } = createMockSessionContext(kernel);

    await expect(
      setupKernel(sessionContext, () => Promise.reject(setupFailed)),
    ).rejects.toBe(setupFailed);
    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(setupFailed);
  });

  it("stops reporting the kernel as prepared as soon as it restarts", async () => {
    const kernel = createMockKernel();
    const { sessionContext, statusChanged } = createMockSessionContext(kernel);

    await setupKernel(sessionContext, () => Promise.resolve());

    statusChanged.emit("restarting");

    const prepared = jest.fn<void, []>();
    waitForKernelToBePrepared(kernel).then(prepared);
    await flushMacrotask();

    expect(prepared).not.toHaveBeenCalled();
  });

  describe("after the kernel was replaced", () => {
    const replacement = createMockKernel("replacement");
    const setup = jest.fn<Promise<void>, [IKernelConnection]>();

    beforeEach(() => {
      // the initial kernel can be set up, the replacement cannot
      setup
        .mockReset()
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(setupFailed);
    });

    const setUpKernel = async (): Promise<MockSessionContext> => {
      const mock = createMockSessionContext(createMockKernel());
      await setupKernel(mock.sessionContext, setup);

      return mock;
    };

    it("records the outcome of the setup of the replacement", async () => {
      const { kernelChanged } = await setUpKernel();

      kernelChanged.emit({
        name: "kernel",
        oldValue: null,
        newValue: replacement,
      });

      await expect(waitForKernelToBePrepared(replacement)).rejects.toBe(
        setupFailed,
      );
    });

    it("reports a failing setup instead of leaving an unhandled rejection", async () => {
      const { sessionContext, kernelChanged } = await setUpKernel();

      const result: unknown = [...kernelChanged.slots][0](sessionContext, {
        name: "kernel",
        oldValue: null,
        newValue: replacement,
      });

      // signals ignore the result of their slots, so it must not be a promise that can reject
      expect(result).toBeUndefined();

      await flushMacrotask();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error setting up the kernel after it changed"),
        setupFailed,
      );
    });
  });
});

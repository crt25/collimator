import { ISessionContext } from "@jupyterlab/apputils";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import {
  executePythonInKernel,
  isKernelPrepared,
  resetKernelPreparation,
  setKernelIsPrepared,
  setupKernel,
  waitForKernelToBePrepared,
} from "../utils";
import { PythonExecutionError } from "../errors/kernel-errors";

type Slot = (sender: unknown, args: unknown) => unknown;

const createKernel = (): IKernelConnection =>
  ({
    name: "python",
    info: Promise.resolve({}),
  }) as unknown as IKernelConnection;

const createSessionContext = (
  kernel: IKernelConnection,
): { sessionContext: ISessionContext; slots: Set<Slot> } => {
  const slots = new Set<Slot>();

  const sessionContext = {
    ready: Promise.resolve(),
    session: { kernel },
    kernelChanged: {
      connect: (slot: Slot): boolean => {
        slots.add(slot);
        return true;
      },
      disconnect: (slot: Slot): boolean => {
        slots.delete(slot);
        return true;
      },
    },
  } as unknown as ISessionContext;

  return { sessionContext, slots };
};

describe("waitForKernelToBePrepared", () => {
  it("resolves once the kernel is prepared", async () => {
    const kernel = createKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });

  it("rejects with the reason if the kernel could not be prepared", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");
    const waiting = waitForKernelToBePrepared(kernel);

    setKernelIsPrepared(kernel, false, reason);

    await expect(waiting).rejects.toBe(reason);
  });

  it("keeps rejecting for those who start waiting after the failure", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");

    // nobody is waiting yet
    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
  });
});

describe("resetKernelPreparation", () => {
  it("reports the outcome of the next preparation after a failed one", async () => {
    const kernel = createKernel();
    setKernelIsPrepared(kernel, false, new Error("installing Otter failed"));

    resetKernelPreparation(kernel);
    const waiting = waitForKernelToBePrepared(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
    await expect(isKernelPrepared(kernel)).resolves.toBe(true);
  });

  it("reports the outcome of the next preparation after a successful one", async () => {
    const kernel = createKernel();
    const reason = new Error("installing Otter failed");
    setKernelIsPrepared(kernel);

    resetKernelPreparation(kernel);
    await expect(isKernelPrepared(kernel)).resolves.toBe(false);

    setKernelIsPrepared(kernel, false, reason);

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(reason);
    await expect(isKernelPrepared(kernel)).resolves.toBe(false);
  });

  it("keeps those already waiting informed if nothing was reported yet", async () => {
    const kernel = createKernel();
    const waiting = waitForKernelToBePrepared(kernel);

    resetKernelPreparation(kernel);
    setKernelIsPrepared(kernel);

    await expect(waiting).resolves.toBeUndefined();
  });
});

describe("executePythonInKernel", () => {
  it("rejects with the Python exception that was raised", async () => {
    const kernel = {
      requestExecute: () => ({
        done: Promise.resolve({
          content: {
            status: "error",
            ename: "ValueError",
            evalue: "Requested 'packaging>=25.0'",
          },
        }),
      }),
    } as unknown as IKernelConnection;

    const error = await executePythonInKernel({ kernel, code: "" }).catch(
      (e) => e,
    );

    expect(error).toBeInstanceOf(PythonExecutionError);
    expect(error.ename).toBe("ValueError");
    expect(error.message).toBe(
      "Error executing code: ValueError: Requested 'packaging>=25.0'",
    );
  });
});

describe("setupKernel", () => {
  beforeEach(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("rejects if the initial setup of the kernel fails", async () => {
    const { sessionContext } = createSessionContext(createKernel());
    const error = new Error("setup failed");

    await expect(
      setupKernel(sessionContext, () => Promise.reject(error)),
    ).rejects.toBe(error);
  });

  it("reports a failing setup of a replacement kernel instead of leaving an unhandled rejection", async () => {
    const { sessionContext, slots } = createSessionContext(createKernel());
    const error = new Error("setup failed");
    const setup = jest
      .fn<Promise<void>, [IKernelConnection]>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(error);

    await setupKernel(sessionContext, setup);

    expect(slots.size).toBe(1);

    const replacement = createKernel();
    const result = [...slots][0](sessionContext, { newValue: replacement });

    // signals ignore the result of their slots, so it must not be a promise that can reject
    expect(result).toBeUndefined();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(setup).toHaveBeenLastCalledWith(replacement);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error setting up the kernel after it changed"),
      error,
    );
  });
});

import { ISessionContext } from "@jupyterlab/apputils";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { executePythonInKernel, setupKernel } from "../utils";
import { PythonExecutionError } from "../errors/kernel-errors";
import { waitForKernelToBePrepared } from "../kernel/kernel-preparation";

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

  it("marks the kernel as prepared once the setup succeeds", async () => {
    const kernel = createKernel();
    const { sessionContext } = createSessionContext(kernel);
    const waiting = waitForKernelToBePrepared(kernel);

    await setupKernel(sessionContext, () => Promise.resolve());

    await expect(waiting).resolves.toBeUndefined();
  });

  it("lets those waiting for the kernel fail if the setup fails", async () => {
    const kernel = createKernel();
    const { sessionContext } = createSessionContext(kernel);
    const error = new Error("setup failed");

    await setupKernel(sessionContext, () => Promise.reject(error)).catch(
      () => {},
    );

    await expect(waitForKernelToBePrepared(kernel)).rejects.toBe(error);
  });

  it("records the outcome of the setup of a replacement kernel", async () => {
    const { sessionContext, slots } = createSessionContext(createKernel());
    const error = new Error("setup failed");
    const setup = jest
      .fn<Promise<void>, [IKernelConnection]>()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(error);

    await setupKernel(sessionContext, setup);

    const replacement = createKernel();
    [...slots][0](sessionContext, { newValue: replacement });

    await expect(waitForKernelToBePrepared(replacement)).rejects.toBe(error);
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

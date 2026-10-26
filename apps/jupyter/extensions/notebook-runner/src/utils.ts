import { ISessionContext } from "@jupyterlab/apputils";
import { IChangedArgs } from "@jupyterlab/coreutils";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { IExecuteReplyMsg } from "@jupyterlab/services/lib/kernel/messages";
import { FileNotFoundError } from "./errors/task-errors";
import { AssignNotebookFormatException } from "./errors/otter-errors";
import { PythonExecutionError } from "./errors/kernel-errors";

const logModule = "[Jupyter][utils]";

const isPreparedKey = "__isPrepared";
const preparedKey = "__prepared";
const preparedSettledKey = "__preparedSettled";
const preparedResolveKey = "__preparedResolve";
const preparedRejectKey = "__preparedReject";

type KernelChangedArgs = IChangedArgs<
  IKernelConnection | null,
  IKernelConnection | null,
  "kernel"
>;

export const executePythonInKernel = async (parameters: {
  kernel: IKernelConnection;
  code: string;
  disposeOnDone?: boolean;
}): Promise<IExecuteReplyMsg> => {
  const reply = await parameters.kernel.requestExecute(
    { code: parameters.code },
    parameters.disposeOnDone,
  ).done;

  if (reply.content.status === "error") {
    if (reply.content.ename === "FileNotFoundError") {
      const path = reply.content.evalue.match(/'(.+?)'/)?.[1] || "unknown";
      throw new FileNotFoundError(path);
    } else if (reply.content.ename.includes("AssignNotebookFormatException")) {
      throw new AssignNotebookFormatException(reply.content.evalue);
    }

    throw new PythonExecutionError(reply.content.ename, reply.content.evalue);
  }

  return reply;
};

const isPatched = (kernel: IKernelConnection): boolean => {
  // @ts-expect-error This is a custom property
  return typeof kernel[isPreparedKey] !== "undefined";
};

const createPreparedPromise = (kernel: IKernelConnection): void => {
  // @ts-expect-error This is a custom property
  kernel[isPreparedKey] = false;
  // @ts-expect-error This is a custom property
  kernel[preparedSettledKey] = false;

  let resolve: () => void;
  let reject: (reason?: unknown) => void;

  const prepared = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // A failed preparation is reported to whoever waits for the kernel to be
  // prepared. Mark the promise as handled so that a failure nobody is waiting
  // for (yet) is not reported as an unhandled promise rejection.
  prepared.catch(() => {});

  // @ts-expect-error This is a custom property
  kernel[preparedKey] = prepared;

  // @ts-expect-error This is a custom property
  kernel[preparedResolveKey] = resolve;
  // @ts-expect-error This is a custom property
  kernel[preparedRejectKey] = reject;
};

export const ensureKernelIsPatched = (kernel: IKernelConnection): void => {
  if (isPatched(kernel)) {
    return;
  }

  createPreparedPromise(kernel);
};

/**
 * Marks the kernel as being (re-)prepared. Call this before preparing a kernel
 * so that a kernel connection that is prepared again (e.g. after a restart)
 * does not keep reporting the outcome of its previous preparation.
 * If nobody has settled the current preparation yet, it is kept so that those
 * already waiting for it are notified about the outcome of this preparation.
 */
export const resetKernelPreparation = (kernel: IKernelConnection): void => {
  // @ts-expect-error This is a custom property
  if (!isPatched(kernel) || kernel[preparedSettledKey]) {
    createPreparedPromise(kernel);
    return;
  }

  // @ts-expect-error This is a custom property
  kernel[isPreparedKey] = false;
};

export const isKernelPrepared = async (
  kernel: IKernelConnection,
): Promise<boolean> => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  return kernel[isPreparedKey];
};

export const waitForKernelToBePrepared = async (
  kernel: IKernelConnection,
): Promise<void> => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  await kernel[preparedKey];
};

/**
 * Marks the kernel as prepared (or as having failed to be prepared), which
 * resolves (or rejects with the given reason) the promise returned by
 * {@link waitForKernelToBePrepared}.
 */
export const setKernelIsPrepared = (
  kernel: IKernelConnection,
  isPrepared: boolean = true,
  reason?: unknown,
): void => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  kernel[isPreparedKey] = isPrepared;
  // @ts-expect-error This is a custom property
  kernel[preparedSettledKey] = true;

  if (isPrepared) {
    // @ts-expect-error This is a custom property
    const resolve = kernel[preparedResolveKey] as () => void;
    resolve();
  } else {
    // @ts-expect-error This is a custom property
    const reject = kernel[preparedRejectKey] as (reason?: unknown) => void;
    reject(reason);
  }
};

export const setupKernel = async (
  sessionContext: ISessionContext,
  setup: (kernel: IKernelConnection) => Promise<void>,
): Promise<void> => {
  console.debug(`${logModule} Waiting for session context to be ready...`);
  await sessionContext.ready;

  let kernel = sessionContext.session?.kernel;

  while (!kernel) {
    await new Promise<void>((resolve) => {
      const onKernelAvailable = (): void => {
        sessionContext.kernelChanged.disconnect(onKernelAvailable);
        kernel = sessionContext.session?.kernel;

        resolve();
      };

      sessionContext.kernelChanged.connect(onKernelAvailable);

      if (sessionContext.session?.kernel) {
        onKernelAvailable();
      }
    });
  }

  await kernel.info;
  await setup(kernel);

  const handleKernelChanged = async (
    sessionCtx: ISessionContext,
    change: KernelChangedArgs,
  ): Promise<void> => {
    let kernel = change.newValue;
    if (kernel === null) {
      console.warn(
        `${logModule} Kernel is not available in session context, restarting...`,
      );

      try {
        sessionCtx.kernelChanged.disconnect(restartListener);

        await sessionCtx.changeKernel({
          name: "python",
        });
      } catch (error) {
        console.error(`${logModule} Error restarting kernel:`, error);
        return;
      } finally {
        sessionCtx.kernelChanged.connect(restartListener);
      }

      await sessionCtx.ready;
      kernel = sessionCtx.session?.kernel || null;

      if (!kernel) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).sessionCtx = sessionCtx;
        throw new Error("Kernel is still not available after restart");
      }
    }

    console.debug(`${logModule} Kernel changed:`, kernel.name);
    await kernel.info;

    return setup(kernel);
  };

  // Signals ignore the promise returned by their slots, so a failure while
  // setting up the new kernel would surface as an unhandled promise rejection.
  // Report it here instead; callers that depend on the setup are notified
  // through the state that `setup` records on the kernel.
  const restartListener = (
    sessionCtx: ISessionContext,
    change: KernelChangedArgs,
  ): void => {
    handleKernelChanged(sessionCtx, change).catch((error) => {
      console.error(
        `${logModule} Error setting up the kernel after it changed:`,
        error,
      );
    });
  };

  sessionContext.kernelChanged.connect(restartListener);
};

/**
 * Writes a JSON object to the virtual filesystem of the given kernel.
 *
 * @param kernel - The kernel connection to execute the write on.
 * @param path - The file path to write the JSON to.
 * @param json - The JSON-serializable object to write.
 * @param chdir - Optional directory to change to after writing.
 */
export const writeJsonToVirtualFilesystem = async (
  kernel: IKernelConnection,
  path: string,
  json: unknown,
  chdir: string | null = null,
): Promise<void> => {
  const jsonString = JSON.stringify(json);
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const binaryString = Array.from(utf8Bytes, (byte) =>
    String.fromCharCode(byte),
  ).join("");

  await executePythonInKernel({
    kernel,
    // it seems as if the encoding here does not allow us to put JSON.stringify directly
    code: `
import base64
from pathlib import Path

json_content = base64.b64decode("${btoa(binaryString)}")

Path("${path}").parent.mkdir(parents=True, exist_ok=True)

with open("${path}", "wb") as f:
  f.write(json_content)

${
  chdir
    ? `import os
os.chdir("${chdir}")
`
    : ""
}
`,
  });
};

export const writeBinaryToVirtualFilesystem = async (
  kernel: IKernelConnection,
  path: string,
  bas64Binary: string,
): Promise<void> => {
  await executePythonInKernel({
    kernel,
    code: `
import base64
from pathlib import Path

base64_content = "${bas64Binary}"
binary_content = base64.b64decode(base64_content)

Path("${path}").parent.mkdir(parents=True, exist_ok=True)

with open("${path}", "wb") as f:
  f.write(binary_content)
          `,
  });
};

export const hasStatus = (error: unknown, status: number): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if ("status" in error && error.status === status) {
    return true;
  }

  if (
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "status" in error.response &&
    error.response.status === status
  ) {
    return true;
  }

  return false;
};

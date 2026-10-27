import { ISessionContext } from "@jupyterlab/apputils";
import { IChangedArgs } from "@jupyterlab/coreutils";
import {
  IKernelConnection,
  Status,
} from "@jupyterlab/services/lib/kernel/kernel";
import { IExecuteReplyMsg } from "@jupyterlab/services/lib/kernel/messages";
import { FileNotFoundError } from "./errors/task-errors";
import { AssignNotebookFormatException } from "./errors/otter-errors";
import { PythonExecutionError } from "./errors/kernel-errors";
import {
  resetKernelPreparation,
  setKernelIsPrepared,
} from "./kernel/kernel-preparation";

const logModule = "[Jupyter][utils]";

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

/**
 * Resolves with the kernel of the session once it has one.
 * This is a separate function so that the slots that setupKernel keeps connected
 * for the lifetime of the session do not keep the initial kernel alive.
 */
const waitForKernel = async (
  sessionContext: ISessionContext,
): Promise<IKernelConnection> => {
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

  return kernel;
};

/**
 * Runs `setup` on the kernel of the session and on every kernel that replaces
 * it or is restarted. The outcome of each setup is recorded on the kernel, so
 * callers can wait for it with `waitForKernelToBePrepared`.
 */
export const setupKernel = async (
  sessionContext: ISessionContext,
  setup: (kernel: IKernelConnection) => Promise<void>,
): Promise<void> => {
  const prepare = async (kernel: IKernelConnection): Promise<void> => {
    resetKernelPreparation(kernel);

    try {
      await setup(kernel);
      setKernelIsPrepared(kernel);
    } catch (error) {
      setKernelIsPrepared(kernel, false, error);
      throw error;
    }
  };

  const kernel = await waitForKernel(sessionContext);

  await kernel.info;
  await prepare(kernel);

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

    return prepare(kernel);
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

  // A restart keeps the kernel connection and only signals it again once the
  // restart is done. Reset its preparation as soon as the restart starts so
  // that nobody is handed the kernel before it is prepared again.
  const handleStatusChanged = (_: ISessionContext, status: Status): void => {
    const kernel = sessionContext.session?.kernel;

    if (kernel && (status === "restarting" || status === "autorestarting")) {
      resetKernelPreparation(kernel);
    }
  };

  sessionContext.statusChanged.connect(handleStatusChanged);
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

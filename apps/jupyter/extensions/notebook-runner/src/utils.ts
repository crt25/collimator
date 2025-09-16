import { ISessionContext } from "@jupyterlab/apputils";
import { IChangedArgs } from "@jupyterlab/coreutils";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";

const isPreparedKey = "__isPrepared";
const preparedKey = "__prepared";
const preparedResolveKey = "__preparedResolve";
const preparedRejectKey = "__preparedReject";

const isPatched = (kernel: IKernelConnection): boolean => {
  // @ts-expect-error This is a custom property
  return typeof kernel[isPreparedKey] !== "undefined";
};

export const ensureKernelIsPatched = (kernel: IKernelConnection): void => {
  if (isPatched(kernel)) {
    return;
  }

  // @ts-expect-error This is a custom property
  kernel[isPreparedKey] = false;

  let resolve: () => void;
  let reject: () => void;

  // @ts-expect-error This is a custom property
  kernel[preparedKey] = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // @ts-expect-error This is a custom property
  kernel[preparedResolveKey] = resolve;
  // @ts-expect-error This is a custom property
  kernel[preparedRejectKey] = reject;
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

export const setKernelIsPrepared = (
  kernel: IKernelConnection,
  isPrepared: boolean = true,
): void => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  kernel[isPreparedKey] = isPrepared;

  if (isPrepared) {
    // @ts-expect-error This is a custom property
    const resolve = kernel[preparedResolveKey] as () => void;
    resolve();
  } else {
    // @ts-expect-error This is a custom property
    const reject = kernel[preparedRejectKey] as () => void;
    reject();
  }
};

export const addKernelListeners = async (
  sessionContext: ISessionContext,
  addListeners: (kernel: IKernelConnection) => Promise<void>,
): Promise<void> => {
  console.debug("Waiting for session context to be ready...");
  await sessionContext.ready;

  while (!sessionContext.session?.kernel) {
    await new Promise<void>((resolve) => {
      const listener = (): void => {
        sessionContext.kernelChanged.disconnect(listener);
        resolve();
      };

      sessionContext.kernelChanged.connect(listener);
    });
  }

  const kernel = sessionContext.session?.kernel;
  await kernel.info;
  await addListeners(kernel);

  const restartListener = async (
    sessionCtx: ISessionContext,
    change: IChangedArgs<
      IKernelConnection | null,
      IKernelConnection | null,
      "kernel"
    >,
  ): Promise<void> => {
    let kernel = change.newValue;
    if (kernel === null) {
      console.warn("Kernel is not available in session context, restarting...");

      try {
        sessionCtx.kernelChanged.disconnect(restartListener);

        await sessionCtx.changeKernel({
          name: "python",
        });
      } catch (error) {
        console.error("Error restarting kernel:", error);
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

    console.debug("Kernel changed:", kernel.name);
    await kernel.info;

    return addListeners(kernel);
  };

  sessionContext.kernelChanged.connect(restartListener);
};

export const writeJsonToVirtualFilesystem = async (
  kernel: IKernelConnection,
  path: string,
  json: unknown,
): Promise<void> => {
  const jsonString = JSON.stringify(json);
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const binaryString = Array.from(utf8Bytes, (byte) =>
    String.fromCharCode(byte),
  ).join("");

  await kernel.requestExecute({
    // it seems as if the encoding here does not allow us to put JSON.stringify directly
    code: `
import base64

json_content = base64.b64decode("${btoa(binaryString)}")

Path("${path}").parent.mkdir(parents=True, exist_ok=True)

with open("${path}", "wb") as f:
  f.write(json_content)
`,
  }).done;
};

export const writeBinaryToVirtualFilesystem = async (
  kernel: IKernelConnection,
  path: string,
  bas64Binary: string,
): Promise<void> => {
  await kernel.requestExecute({
    code: `
import base64

base64_content = "${bas64Binary}"
binary_content = base64.b64decode(base64_content)

Path("${path}").parent.mkdir(parents=True, exist_ok=True)

with open("${path}", "wb") as f:
  f.write(binary_content)
          `,
  }).done;
};

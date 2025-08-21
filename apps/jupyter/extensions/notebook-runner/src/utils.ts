import { ISessionContext } from "@jupyterlab/apputils";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";

const isPreparedString = "__isPrepared";
const preparedString = "__prepared";
const preparedResolveString = "__preparedResolve";
const preparedRejectString = "__preparedReject";

const isPatched = (kernel: IKernelConnection): boolean => {
  // @ts-expect-error This is a custom property
  return typeof kernel[isPreparedString] !== "undefined";
};

export const ensureKernelIsPatched = (kernel: IKernelConnection): void => {
  if (isPatched(kernel)) {
    return;
  }

  // @ts-expect-error This is a custom property
  kernel[isPreparedString] = false;

  let resolve: () => void;
  let reject: () => void;

  // @ts-expect-error This is a custom property
  kernel[preparedString] = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // @ts-expect-error This is a custom property
  kernel[preparedResolveString] = resolve;
  // @ts-expect-error This is a custom property
  kernel[preparedRejectString] = reject;
};

export const isKernelPrepared = async (
  kernel: IKernelConnection,
): Promise<boolean> => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  return kernel[isPreparedString];
};

export const waitForKernelToBePrepared = async (
  kernel: IKernelConnection,
): Promise<void> => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  await kernel[preparedString];
};

export const setKernelIsPrepared = (
  kernel: IKernelConnection,
  isPrepared: boolean = true,
): void => {
  ensureKernelIsPatched(kernel);

  // @ts-expect-error This is a custom property
  kernel[isPreparedString] = isPrepared;

  if (isPrepared) {
    // @ts-expect-error This is a custom property
    const resolve = kernel[preparedResolveString] as () => void;
    resolve();
  } else {
    // @ts-expect-error This is a custom property
    const reject = kernel[preparedRejectString] as () => void;
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
    console.debug("Starting kernel...");
    await sessionContext.startKernel();
  }

  const kernel = sessionContext.session?.kernel;
  await kernel.info;
  await addListeners(kernel);

  sessionContext.kernelChanged.connect(async (sessionCtx) => {
    const kernel = sessionCtx.session?.kernel;
    if (!kernel) {
      console.warn("Kernel is not available in session context");

      // simply return, the function will be called again when the kernel is changed
      return;
    }

    console.log("Kernel changed:", kernel.name);
    await kernel.info;

    return addListeners(kernel);
  });
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
base64_content = "${bas64Binary}"
binary_content = base64.b64decode(base64_content)

Path("${path}").parent.mkdir(parents=True, exist_ok=True)

with open("${path}", "wb") as f:
  f.write(binary_content)
          `,
  }).done;
};

import { KernelSpec } from "@jupyterlab/services";

const logModule = "[Jupyter][kernel/wait-for-kernel-specs]";

// kernelspec registration happens during startup (local JS, no downloads),
// so this is generous; it only matters when the kernel extension is broken
const defaultTimeoutMs = 15_000;

type SpecsChangedCallback = (
  sender: unknown,
  specs: KernelSpec.ISpecModels | null,
) => void;

/**
 * The slice of KernelSpec.IManager the wait needs - kept structural so tests
 * can provide a plain stub.
 */
export interface KernelSpecWaitTarget {
  readonly ready: Promise<void>;
  readonly specs: KernelSpec.ISpecModels | null;
  readonly specsChanged: {
    connect(callback: SpecsChangedCallback): unknown;
    disconnect(callback: SpecsChangedCallback): unknown;
  };
}

/**
 * Resolves once at least one kernelspec (the Pyodide kernel) is registered,
 * or after a bounded wait. Opening a notebook before any spec is registered
 * makes JupyterLab prompt the user to pick a kernel (CRT-399): the session
 * initialization cannot resolve a default kernel without specs, no matter
 * what the notebook's metadata says. The wait is bounded so that a broken
 * kernel extension degrades to the pre-existing behavior (the notebook opens
 * and JupyterLab may prompt for a kernel) instead of hanging the caller -
 * and with it the embedded app - forever.
 */
export const waitForKernelSpecs = async (
  kernelSpecs: KernelSpecWaitTarget,
  timeoutMs: number = defaultTimeoutMs,
): Promise<void> => {
  await kernelSpecs.ready;

  const hasSpec = (specs = kernelSpecs.specs): boolean =>
    !!specs && Object.keys(specs.kernelspecs).length > 0;

  if (hasSpec()) {
    return;
  }

  await new Promise<void>((resolve) => {
    // specsChanged emits the freshly fetched specs, so use the emitted
    // payload instead of re-reading the manager's mutable specs property
    function onChange(
      _sender: unknown,
      specs: KernelSpec.ISpecModels | null,
    ): void {
      if (hasSpec(specs)) {
        clearTimeout(timeout);
        kernelSpecs.specsChanged.disconnect(onChange);
        resolve();
      }
    }

    const timeout = setTimeout(() => {
      kernelSpecs.specsChanged.disconnect(onChange);
      console.warn(
        `${logModule} No kernelspec registered after ${timeoutMs}ms; opening the notebook anyway (the kernel selection dialog may appear)`,
      );
      resolve();
    }, timeoutMs);

    kernelSpecs.specsChanged.connect(onChange);

    // Re-check after connecting so that a spec registered between the check
    // above and the connect cannot be missed. This makes the wait correct by
    // inspection instead of relying on the surrounding block staying free of
    // awaits between the check and the connect.
    if (hasSpec()) {
      clearTimeout(timeout);
      kernelSpecs.specsChanged.disconnect(onChange);
      resolve();
    }
  });
};

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
 * Resolves once at least one kernelspec - in this app that is the Pyodide
 * kernel - is registered, or after a bounded wait. Opening a notebook before
 * any spec is registered makes JupyterLab prompt the user to pick a kernel
 * (CRT-399): the session initialization cannot resolve a default kernel
 * without specs, no matter what the notebook's metadata says. The wait is
 * bounded - and covers waiting for the manager to become ready - so that a
 * broken, slow or rejecting kernel extension degrades to the pre-existing
 * behavior (the notebook opens and JupyterLab may prompt for a kernel)
 * instead of hanging the caller, and with it the embedded app, forever.
 */
export const waitForKernelSpecs = async (
  kernelSpecs: KernelSpecWaitTarget,
  timeoutMs: number = defaultTimeoutMs,
): Promise<void> => {
  const hasSpec = (specs = kernelSpecs.specs): boolean =>
    !!specs && Object.keys(specs.kernelspecs).length > 0;

  await new Promise<void>((resolve) => {
    let settled = false;

    const finish = (): void => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      kernelSpecs.specsChanged.disconnect(onChange);
      resolve();
    };

    // specsChanged emits the freshly fetched specs, so use the emitted
    // payload instead of re-reading the manager's mutable specs property
    function onChange(
      _sender: unknown,
      specs: KernelSpec.ISpecModels | null,
    ): void {
      if (hasSpec(specs)) {
        finish();
      }
    }

    // Arm the deadline and the listener before awaiting readiness, so a
    // manager that never becomes ready (or whose readiness rejects) still
    // falls back through this same timeout rather than hanging the caller.
    const timeout = setTimeout(() => {
      console.warn(
        `${logModule} No kernelspec registered after ${timeoutMs}ms; opening the notebook anyway (the kernel selection dialog may appear)`,
      );
      finish();
    }, timeoutMs);

    kernelSpecs.specsChanged.connect(onChange);

    // a spec may already be present, or arrive once the manager is ready; a
    // rejected readiness is treated the same as the timeout fallback
    if (hasSpec()) {
      finish();
    }
    void kernelSpecs.ready
      .then(() => {
        if (hasSpec()) {
          finish();
        }
      })
      .catch(() => {
        // fall through to the bounded wait / timeout above
      });
  });
};

import { KernelSpec } from "@jupyterlab/services";

const logModule = "[Jupyter][kernel-specs]";

/**
 * kernelspec registration happens during startup (local JS, no downloads),
 * so this is generous; it only matters when the kernel extension is broken
 */
export const kernelSpecWaitTimeoutMs = 15_000;

/**
 * Resolves once at least one kernelspec (the Pyodide kernel) is registered, or
 * after a bounded wait.
 *
 * Anything that starts a kernel must await this first. `SessionContext` reads
 * `specsManager.specs` synchronously and JupyterLite returns `null` until the
 * first spec is registered; on `null` the session context gives up and reports
 * that the user has to pick a kernel — which for a visible notebook means the
 * kernel selection dialog, and for a headless session context means its
 * `ready` promise never settles at all.
 *
 * The wait is bounded so that a broken kernel extension degrades to the
 * pre-existing behavior instead of hanging the caller forever.
 */
export const waitForKernelSpecs = async (
  kernelSpecs: KernelSpec.IManager,
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
    function onChange(_sender: unknown, specs: typeof kernelSpecs.specs): void {
      if (hasSpec(specs)) {
        clearTimeout(timeout);
        kernelSpecs.specsChanged.disconnect(onChange);
        resolve();
      }
    }

    const timeout = setTimeout(() => {
      kernelSpecs.specsChanged.disconnect(onChange);
      console.warn(
        `${logModule} No kernelspec registered after ${kernelSpecWaitTimeoutMs}ms; continuing anyway (the kernel selection dialog may appear)`,
      );
      resolve();
    }, kernelSpecWaitTimeoutMs);

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

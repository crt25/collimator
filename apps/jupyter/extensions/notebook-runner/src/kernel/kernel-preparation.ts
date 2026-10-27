import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";

type PreparationState = "pending" | "prepared" | "failed";

interface Preparation {
  state: PreparationState;
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason: unknown) => void;
}

// keyed by the connection so that the state is released together with it
const preparations = new WeakMap<IKernelConnection, Preparation>();

const createPreparation = (kernel: IKernelConnection): Preparation => {
  let resolve: () => void = () => {};
  let reject: (reason: unknown) => void = () => {};

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  // A failed preparation is reported to whoever waits for the kernel to be
  // prepared. Mark the promise as handled so that a failure nobody is waiting
  // for (yet) is not reported as an unhandled promise rejection.
  promise.catch(() => {});

  const preparation: Preparation = {
    state: "pending",
    promise,
    resolve,
    reject,
  };
  preparations.set(kernel, preparation);

  return preparation;
};

const getPreparation = (kernel: IKernelConnection): Preparation =>
  preparations.get(kernel) ?? createPreparation(kernel);

/**
 * Marks the kernel as being (re-)prepared. Call this before preparing a kernel
 * so that a kernel connection that is prepared again (e.g. after a restart,
 * which keeps the connection) does not keep reporting the outcome of its
 * previous preparation. A pending preparation is kept so that those already
 * waiting for it are notified about the outcome of this preparation.
 */
export const resetKernelPreparation = (kernel: IKernelConnection): void => {
  if (getPreparation(kernel).state !== "pending") {
    createPreparation(kernel);
  }
};

export const waitForKernelToBePrepared = (
  kernel: IKernelConnection,
): Promise<void> => getPreparation(kernel).promise;

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
  const preparation = getPreparation(kernel);

  if (isPrepared) {
    preparation.state = "prepared";
    preparation.resolve();
  } else {
    preparation.state = "failed";
    preparation.reject(reason);
  }
};

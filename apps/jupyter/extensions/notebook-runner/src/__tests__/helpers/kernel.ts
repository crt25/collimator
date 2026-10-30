import type { ISessionContext } from "@jupyterlab/apputils";
import type { IChangedArgs } from "@jupyterlab/coreutils";
import type { KernelMessage } from "@jupyterlab/services";
import type {
  IKernelConnection,
  Status,
} from "@jupyterlab/services/lib/kernel/kernel";

export type KernelChangedArgs = IChangedArgs<
  IKernelConnection | null,
  IKernelConnection | null,
  "kernel"
>;

export type MockSlot<TSender, TArgs> = (sender: TSender, args: TArgs) => void;

export interface MockSignal<TSender, TArgs> {
  readonly slots: Set<MockSlot<TSender, TArgs>>;
  connect(slot: MockSlot<TSender, TArgs>): boolean;
  disconnect(slot: MockSlot<TSender, TArgs>): boolean;
  emit(args: TArgs): void;
}

/**
 * A minimal stand-in for a lumino signal that calls its slots synchronously.
 */
export const createMockSignal = <TSender, TArgs>(
  sender: TSender,
): MockSignal<TSender, TArgs> => {
  const slots = new Set<MockSlot<TSender, TArgs>>();

  return {
    slots,
    connect: (slot): boolean => {
      slots.add(slot);
      return true;
    },
    disconnect: (slot): boolean => {
      slots.delete(slot);
      return true;
    },
    emit: (args): void => {
      // copy so that slots can disconnect themselves while being called
      for (const slot of [...slots]) {
        slot(sender, args);
      }
    },
  };
};

type ExecuteReplyContent = Pick<
  KernelMessage.IExecuteReplyMsg["content"],
  "status"
> &
  Partial<Pick<KernelMessage.IReplyErrorContent, "ename" | "evalue">>;

/**
 * A kernel whose code executions all reply with the given content.
 */
export const createMockKernel = (
  id = "kernel",
  reply: ExecuteReplyContent = { status: "ok" },
): IKernelConnection =>
  ({
    id,
    name: "python",
    info: Promise.resolve({}),
    registerCommTarget: jest.fn(),
    requestExecute: jest.fn(() => ({
      done: Promise.resolve({ content: reply }),
    })),
  }) as unknown as IKernelConnection;

/**
 * The code that was executed in a kernel created by {@link createMockKernel}.
 */
export const executedCode = (kernel: IKernelConnection): string[] =>
  jest
    .mocked(kernel.requestExecute)
    .mock.calls.map(([content]) => content.code);

export interface MockSessionContext {
  sessionContext: ISessionContext;
  kernelChanged: MockSignal<ISessionContext, KernelChangedArgs>;
  statusChanged: MockSignal<ISessionContext, Status>;
}

/**
 * A session context that is ready and has the given kernel.
 */
export const createMockSessionContext = (
  kernel: IKernelConnection,
): MockSessionContext => {
  const sessionContext = {
    ready: Promise.resolve(),
    session: { kernel },
  } as unknown as ISessionContext;

  const kernelChanged = createMockSignal<ISessionContext, KernelChangedArgs>(
    sessionContext,
  );
  const statusChanged = createMockSignal<ISessionContext, Status>(
    sessionContext,
  );

  Object.assign(sessionContext, { kernelChanged, statusChanged });

  return { sessionContext, kernelChanged, statusChanged };
};

/**
 * Lets the event loop run once, e.g. so that slots that were called by a signal
 * finish their asynchronous work.
 */
export const flushMacrotask = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

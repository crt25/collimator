import { JupyterFrontEnd } from "@jupyterlab/application";
import { SessionContext } from "@jupyterlab/apputils";
import {
  IComm,
  IKernelConnection,
} from "@jupyterlab/services/lib/kernel/kernel";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { KernelMessage } from "@jupyterlab/services";
import {
  setupKernel,
  executePythonInKernel,
  setKernelIsPrepared,
  waitForKernelToBePrepared,
  withTimeout,
} from "./utils";
import { installNbConvert, installOtter } from "./packages";
import { waitForKernelSpecs } from "./kernel-specs";
import { OtterKernelNotReadyError } from "./errors/kernel-errors";

const logModule = "[Jupyter][notebook-runner-state]";

/**
 * A listener that is called when a comm message is received from the kernel.
 */
export type CommListener = (
  comm: IComm,
  message: KernelMessage.ICommMsgMsg<"shell" | "iopub">,
) => Promise<void>;

export class NotebookRunnerState {
  /**
   * The unique name identifying the comm channel ('target').
   */
  public static commChannelName = "notebook-runner";

  /**
   * Preparing the grading kernel downloads the Pyodide runtime and installs
   * otter-grader and nbconvert, so this has to accommodate a slow connection.
   * It also starts as soon as the app boots, long before anyone can hit save,
   * so in practice the kernel is ready well before this budget is spent.
   */
  private static readonly otterKernelReadyTimeoutMs = 120_000;

  private _resolveOtterSessionContext: (value: SessionContext) => void =
    () => {};

  public otterSessionContext: Promise<SessionContext> =
    new Promise<SessionContext>((resolve) => {
      this._resolveOtterSessionContext = resolve;
    });

  /**
   * List of registered comm listeners that are called when a message is received from the kernel
   * on the custom comm channel.
   */
  private commListeners: CommListener[] = [];

  constructor(
    protected readonly app: JupyterFrontEnd,
    protected readonly documentManager: IDocumentManager,
    protected readonly notebookTracker: INotebookTracker,
    public allowNextNotebookInParallel: boolean = false,
  ) {
    this.init();
  }

  /**
   * Adds a comm listener that is called when a message is received from the kernel
   * @param listener The listener to add
   */
  public addCommListener(listener: CommListener): void {
    this.commListeners.push(listener);
  }

  /**
   * Removes a comm listener that is called when a message is received from the kernel
   * @param listener The listener to remove
   */
  public removeCommListener(listener: CommListener): void {
    this.commListeners = this.commListeners.filter((l) => l !== listener);
  }

  private async init(): Promise<void> {
    let sessionContext: SessionContext | undefined = undefined;

    try {
      const serviceManager = this.app.serviceManager;

      // SessionContext picks the kernel to auto-start from the registered
      // kernelspecs, and it reads them synchronously. Starting before the
      // Pyodide kernelspec is registered makes it report that the user has to
      // pick a kernel, and in that branch `sessionContext.ready` is never
      // resolved *and never rejected* - which would deadlock every save and
      // submission waiting on this context.
      await waitForKernelSpecs(serviceManager.kernelspecs);

      console.debug(`${logModule} Initializing Otter session context...`);
      sessionContext = new SessionContext({
        sessionManager: serviceManager.sessions,
        specsManager: serviceManager.kernelspecs,
        name: "otter-session",
        type: "notebook",
        kernelPreference: {
          shouldStart: true,
          canStart: true,
          autoStartDefault: true,
        },
      });

      // Initialize the session
      console.debug(`${logModule} Initializing otter context...`);
      await sessionContext.initialize();

      console.debug(`${logModule} Adding kernel listeners to otter context...`);

      await setupKernel(sessionContext, async (kernel) => {
        console.debug(
          `${logModule} Kernel is ready:`,
          kernel.name,
          "attaching listeners...",
        );
        this.registerCommTarget(kernel);
        await this.prepareOtterKernel(kernel);
      });

      console.debug(`${logModule} Otter context initialized:`, sessionContext);

      this._resolveOtterSessionContext(sessionContext);

      return;
    } catch (e) {
      if (sessionContext) {
        let disposed: () => void = () => {};
        const isDisposed = new Promise<void>((resolve) => {
          disposed = resolve;
        });
        sessionContext.disposed.connect(disposed);
        sessionContext?.dispose();

        await isDisposed;
      }

      console.error(
        `${logModule} Error initializing otter context:`,
        e,
        ". Restarting...",
      );
      return this.init();
    }
  }

  /**
   * This function registers a custom comm target on the given kernel
   * to allow for bidirectional communication between the extension and the kernel.¨
   * Unfortunately, the communication from the extension to the kernel is not reliable
   * in the sense that callbacks are only executed **after** the cell execution has finished
   * meaning you cannot wait for a response from python while a cell is still running.
   *
   * This function calls all registered comm listeners when a message is received
   * through the comm channel with the received message.
   * If you want to know more about comms in general, see https://jupyter-notebook.readthedocs.io/en/4.x/comms.html.
   * @param kernel The kernel to register the comm target on
   */
  private registerCommTarget(kernel: IKernelConnection): void {
    // create a custom comm target, overriding any existing one with the same name
    kernel.registerCommTarget(NotebookRunnerState.commChannelName, (comm) => {
      // Handle the comm message
      comm.onMsg = async (msg): Promise<void> => {
        await Promise.all(
          this.commListeners.map((listener) => listener(comm, msg)),
        );
      };
    });
  }

  private async prepareOtterKernel(kernel: IKernelConnection): Promise<void> {
    console.debug(`${logModule} Preparing Otter kernel:`, kernel.name);

    console.debug(`${logModule} Importing basic libraries...`);
    await executePythonInKernel({
      kernel,
      code: `
from ipykernel.comm import Comm
`,
      disposeOnDone: true,
    });

    await installOtter(kernel);
    await installNbConvert(kernel);

    console.debug(`${logModule} Importing Otter Grader...`);
    await executePythonInKernel({
      kernel,
      code: `
from otter.assign import main as assign
from otter.run import main as run
      `,
      disposeOnDone: true,
    });

    console.debug(`${logModule} Otter Grader is ready to be used!`, kernel);
    setKernelIsPrepared(kernel);
  }

  public async restartOtterKernel(): Promise<void> {
    const sessionContext = await this.otterSessionContext;

    await sessionContext.restartKernel();
  }

  /**
   * The single entry point every save/submit path takes to reach the grading
   * kernel. The wait is bounded: none of the steps below is guaranteed to
   * settle (kernel preparation can stall on a slow or blocked download, and a
   * session context that never got a kernel never resolves its `ready`
   * promise), and a save that hangs leaves the user staring at a spinner with
   * no error and no way out.
   */
  public async getOtterKernel(): Promise<IKernelConnection> {
    return withTimeout(
      this.connectToPreparedOtterKernel(),
      NotebookRunnerState.otterKernelReadyTimeoutMs,
      () => {
        console.error(
          `${logModule} Otter kernel was not ready after ${NotebookRunnerState.otterKernelReadyTimeoutMs}ms`,
        );

        return new OtterKernelNotReadyError();
      },
    );
  }

  private async connectToPreparedOtterKernel(): Promise<IKernelConnection> {
    const sessionContext = await this.otterSessionContext;

    if (!sessionContext.session?.kernel) {
      console.debug(
        `${logModule} No kernel available in otter session context, starting one...`,
        sessionContext.session,
      );

      // startKernel() reports back instead of throwing when it found no
      // kernelspec to auto-select, so retrying it without first waiting for
      // the specs would spin without ever making progress.
      await waitForKernelSpecs(this.app.serviceManager.kernelspecs);
      await sessionContext.startKernel();
    }

    const kernel = sessionContext.session?.kernel;

    if (!kernel) {
      throw new OtterKernelNotReadyError();
    }

    console.debug(
      `${logModule} Kernel is available in otter session, waiting for it to be prepared:`,
      kernel,
    );
    await waitForKernelToBePrepared(kernel);

    return kernel;
  }

  readJsonFromVirtualFilesystem = async <T>(
    kernel: IKernelConnection,
    path: string,
  ): Promise<T> => {
    const results = await this.readFromVirtualFilesystem(
      kernel,
      path,
      `
with open("${path}", "r", encoding="utf-8") as f:
  json_content = f.read()

comm = Comm(target_name='${NotebookRunnerState.commChannelName}')
comm.send(data={'results': json_content})
`,
    );

    return JSON.parse(results);
  };

  readBinaryFromVirtualFilesystem = async (
    kernel: IKernelConnection,
    path: string,
  ): Promise<string> => {
    return this.readFromVirtualFilesystem(
      kernel,
      path,
      `
import base64

with open("${path}", "rb") as f:
  binary_content = f.read()

base64_content = base64.b64encode(binary_content).decode("utf-8")

comm = Comm(target_name='${NotebookRunnerState.commChannelName}')
comm.send(data={'results': base64_content})
`,
    );
  };

  private readFromVirtualFilesystem = async (
    kernel: IKernelConnection,
    path: string,
    code: string,
  ): Promise<string> => {
    let receiveResults: (results: string) => void = () => {};
    let rejectResults: (reason?: Error) => void = () => {};
    const waitForResults = new Promise<string>((resolve, reject) => {
      receiveResults = resolve;
      rejectResults = reject;
    });
    const resultTimeout = setTimeout(() => {
      rejectResults(new Error(`Timeout waiting for reading ${path}`));
    }, 1000 * 60);

    const commListener: CommListener = async (comm, msg) => {
      clearTimeout(resultTimeout);
      this.removeCommListener(commListener);

      const { data } = msg.content;
      if (typeof data.results === "string") {
        receiveResults(data.results);
      }

      rejectResults(
        new Error("Invalid results message: " + JSON.stringify(data)),
      );
    };

    this.addCommListener(commListener);

    try {
      await executePythonInKernel({
        kernel,
        code,
      });
    } catch (error) {
      this.removeCommListener(commListener);
      clearTimeout(resultTimeout);

      if (error instanceof Error) {
        rejectResults(error);
      } else {
        rejectResults(
          new Error(`Error executing code to read ${path}: ${error}`),
        );
      }
    }

    return waitForResults;
  };
}

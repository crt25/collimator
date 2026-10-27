import { JupyterFrontEnd } from "@jupyterlab/application";
import { SessionContext } from "@jupyterlab/apputils";
import {
  IComm,
  IKernelConnection,
} from "@jupyterlab/services/lib/kernel/kernel";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { KernelMessage } from "@jupyterlab/services";
import { setupKernel, executePythonInKernel } from "./utils";
import { waitForKernelToBePrepared } from "./kernel/kernel-preparation";
import { installNbConvert, installOtter } from "./packages";
import { OtterKernelPreparationError } from "./errors/otter-errors";

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
   * How often the otter session is (re-)created before giving up. Retrying
   * forever would leave everything that waits for the otter kernel - such as
   * saving a task - hanging.
   */
  private static maxInitAttempts = 3;

  /**
   * How long to wait before re-creating the otter session, multiplied by the
   * number of failed attempts. Retrying right away would likely hit the same
   * temporary problem (e.g. a failed download).
   */
  private static initRetryDelayMs = 500;

  private _resolveOtterSessionContext: (value: SessionContext) => void =
    () => {};
  private _rejectOtterSessionContext: (reason: unknown) => void = () => {};

  /**
   * Resolves once the otter session has been initialized and its kernel prepared.
   * Rejects with an {@link OtterKernelPreparationError} if that was not possible.
   */
  public otterSessionContext: Promise<SessionContext> =
    new Promise<SessionContext>((resolve, reject) => {
      this._resolveOtterSessionContext = resolve;
      this._rejectOtterSessionContext = reject;
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
    // The failure is reported to everyone who awaits the promise (see getOtterKernel).
    // Mark it as handled so that a failure that happens before anyone awaits it
    // is not reported as an unhandled promise rejection.
    this.otterSessionContext.catch(() => {});

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
    for (let attempt = 1; ; attempt++) {
      try {
        this._resolveOtterSessionContext(
          await this.createOtterSessionContext(),
        );
        return;
      } catch (e) {
        // Installing the packages is deterministic, a fresh session would fail the same way.
        const isPreparationFailure = e instanceof OtterKernelPreparationError;
        const willRetry =
          !isPreparationFailure &&
          attempt < NotebookRunnerState.maxInitAttempts;

        console.error(
          `${logModule} Error initializing otter context (attempt ${attempt}/${NotebookRunnerState.maxInitAttempts}):`,
          e,
          willRetry ? ". Restarting..." : ". Giving up.",
        );

        if (!willRetry) {
          // Do not retry forever: reject so that everything waiting for the otter
          // kernel (e.g. saving a task) fails with an error instead of hanging.
          this._rejectOtterSessionContext(
            isPreparationFailure
              ? e
              : new OtterKernelPreparationError(attempt, e),
          );
          return;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, NotebookRunnerState.initRetryDelayMs * attempt),
        );
      }
    }
  }

  /**
   * Creates the otter session and prepares its kernel.
   * A session that cannot be set up is disposed before the error is rethrown.
   */
  private async createOtterSessionContext(): Promise<SessionContext> {
    let sessionContext: SessionContext | undefined = undefined;

    try {
      const serviceManager = this.app.serviceManager;

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
          // a failed attempt disposes the context, which must not leave its kernel running
          shutdownOnDispose: true,
        },
      });

      // Initialize the session
      console.debug(`${logModule} Initializing otter context...`);
      await sessionContext.initialize();

      console.debug(`${logModule} Adding kernel listeners to otter context...`);

      await setupKernel(sessionContext, (kernel) =>
        this.setupOtterKernel(kernel),
      );

      console.debug(`${logModule} Otter context initialized:`, sessionContext);

      return sessionContext;
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

      throw e;
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

  /**
   * Sets up the given kernel to run Otter. setupKernel records the outcome on
   * the kernel, so everything that waits for it (see getOtterKernel) fails with
   * an {@link OtterKernelPreparationError} if it could not be prepared.
   */
  private async setupOtterKernel(kernel: IKernelConnection): Promise<void> {
    try {
      console.debug(
        `${logModule} Kernel is ready:`,
        kernel.name,
        "attaching listeners...",
      );
      this.registerCommTarget(kernel);

      await this.prepareOtterKernel(kernel);
    } catch (error) {
      throw new OtterKernelPreparationError(1, error);
    }
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
  }

  public async restartOtterKernel(): Promise<void> {
    const sessionContext = await this.otterSessionContext;

    await sessionContext.restartKernel();
  }

  /**
   * Resolves with the prepared otter kernel.
   * Rejects with an {@link OtterKernelPreparationError} if it could not be prepared.
   */
  public async getOtterKernel(): Promise<IKernelConnection> {
    const sessionContext = await this.otterSessionContext;

    while (!sessionContext.session?.kernel) {
      console.debug(
        `${logModule} No kernel available in otter session context, restarting the kernel...`,
        sessionContext.session,
      );
      await sessionContext.startKernel();
    }

    console.debug(
      `${logModule} Kernel is available in otter session, waiting for it to be prepared:`,
      sessionContext.session.kernel,
    );
    await waitForKernelToBePrepared(sessionContext.session.kernel);

    return sessionContext.session.kernel;
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

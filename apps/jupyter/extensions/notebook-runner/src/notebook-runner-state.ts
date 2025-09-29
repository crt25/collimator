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
  addKernelListeners,
  setKernelIsPrepared,
  waitForKernelToBePrepared,
} from "./utils";
import { installNbConvert, installOtter, patchNumpy } from "./packages";

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

      console.debug("Initializing Otter session context...");
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
      console.debug("Initializing otter context...");
      await sessionContext.initialize();

      console.debug("Adding kernel listeners to otter context...");

      await addKernelListeners(sessionContext, async (kernel) => {
        console.debug(
          "Kernel is ready:",
          kernel.name,
          "attaching listeners...",
        );
        this.registerCommTarget(kernel);
        await this.prepareOtterKernel(kernel);
      });

      console.debug("Otter context initialized:", sessionContext);

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

      console.error("Error initializing otter context:", e, ". Restarting...");
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
    console.debug("Preparing Otter kernel:", kernel.name);

    console.debug("Importing basic libraries...");
    await kernel.requestExecute(
      {
        code: `
from ipykernel.comm import Comm
`,
      },
      true,
    ).done;

    await installOtter(kernel);
    await installNbConvert(kernel);
    await patchNumpy(kernel);

    console.debug("Importing Otter Grader...");
    await kernel.requestExecute(
      {
        code: `
from otter.assign import main as assign
from otter.run import main as run
      `,
      },
      true,
    ).done;

    console.debug("Otter Grader is ready to be used!", kernel);
    setKernelIsPrepared(kernel);
  }

  public async restartOtterKernel(): Promise<void> {
    const sessionContext = await this.otterSessionContext;

    await sessionContext.restartKernel();
  }

  public async getOtterKernel(): Promise<IKernelConnection> {
    const sessionContext = await this.otterSessionContext;

    while (!sessionContext.session?.kernel) {
      console.debug(
        "No kernel available in otter session context, restarting the kernel...",
        sessionContext.session,
      );
      await sessionContext.startKernel();
    }

    console.debug(
      "Kernel is available in otter session, waiting for it to be prepared:",
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

    await kernel.requestExecute({
      code,
    }).done;

    return waitForResults;
  };
}

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
import { importBasePackages, installNbConvert, installOtter } from "./packages";

export type CommListener = (
  comm: IComm,
  message: KernelMessage.ICommMsgMsg<"shell" | "iopub">,
) => Promise<void>;

export class NotebookRunnerState {
  public static commTargetName = "notebook-runner";

  private _resolveOtterSessionContext: (value: SessionContext) => void =
    () => {};

  public otterSessionContext: Promise<SessionContext> =
    new Promise<SessionContext>((resolve) => {
      this._resolveOtterSessionContext = resolve;
    });

  private commListeners: CommListener[] = [];

  constructor(
    protected readonly app: JupyterFrontEnd,
    protected readonly documentManager: IDocumentManager,
    protected readonly notebookTracker: INotebookTracker,
    public allowNextNotebookInParallel: boolean = false,
  ) {
    this.init();
  }

  public addCommListener(listener: CommListener): void {
    this.commListeners.push(listener);
  }

  public removeCommListener(listener: CommListener): void {
    this.commListeners = this.commListeners.filter((l) => l !== listener);
  }

  private async init(): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    const initPromise = new Promise<SessionContext>(async (resolve, reject) => {
      let sessionContext: SessionContext | undefined = undefined;

      try {
        const serviceManager = this.app.serviceManager;

        console.log("Initializing Otter session context..");
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
        console.debug("Initializing otter context..");
        await sessionContext.initialize();

        console.log("Adding kernel listeners to otter context..");

        await addKernelListeners(sessionContext, async (kernel) => {
          console.debug(
            "Kernel is ready:",
            kernel.name,
            "attaching listeners..",
          );
          this.registerCommTarget(kernel);
          await this.prepareOtterKernel(kernel);
        });

        console.debug("Otter context initialized:", sessionContext);
        resolve(sessionContext);
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

        reject(e);
        return;
      }
    });

    try {
      const sessionContext = await initPromise;
      this._resolveOtterSessionContext(sessionContext);
    } catch (e) {
      console.error("Error initializing otter context:", e, ". Restarting..");
      return this.init();
    }
  }

  private registerCommTarget(kernel: IKernelConnection): void {
    // create a custom comm target, overriding any existing one with the same name
    kernel.registerCommTarget(NotebookRunnerState.commTargetName, (comm) => {
      // Handle the comm message
      comm.onMsg = async (msg): Promise<void> => {
        await Promise.all(
          this.commListeners.map((listener) => listener(comm, msg)),
        );
      };
    });
  }

  private async prepareOtterKernel(kernel: IKernelConnection): Promise<void> {
    console.log("Preparing Otter kernel:", kernel.name);

    console.log("Importing basic libraries..");
    await kernel.requestExecute(
      {
        code: `
        from ipykernel.comm import Comm
      `,
      },
      true,
    ).done;

    await importBasePackages(kernel);
    await installOtter(kernel);
    await installNbConvert(kernel);

    console.log("Importing Otter Grader..");
    await kernel.requestExecute(
      {
        code: `
      # import otter
      from otter.assign import main as assign
      from otter.run import main as run
      `,
      },
      true,
    ).done;

    console.log("Otter Grader is ready to be used!", kernel);
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
        "No kernel available in otter session context, restarting the kernel..",
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
    let receiveResults: (results: T) => void = () => {};
    let rejectResults: (reason?: Error) => void = () => {};
    const waitForResults = new Promise<T>((resolve, reject) => {
      receiveResults = resolve;
      rejectResults = reject;
    });
    const resultTimeout = setTimeout(() => {
      rejectResults(new Error(`Timeout waiting for reading ${path}`));
    }, 1000 * 5);

    const commListener: CommListener = async (comm, msg) => {
      clearTimeout(resultTimeout);
      this.removeCommListener(commListener);

      const { data } = msg.content;
      if (typeof data.results === "string") {
        receiveResults(JSON.parse(data.results));
      }

      rejectResults(
        new Error("Invalid results message: " + JSON.stringify(data)),
      );
    };

    this.addCommListener(commListener);

    await kernel.requestExecute({
      code: `
with open("${path}", "r", encoding="utf-8") as f:
  json_content = f.read()

comm = Comm(target_name='notebook-runner')
comm.send(data={'results': json_content})
`,
    }).done;

    return waitForResults;
  };

  readBinaryFromVirtualFilesystem = async (
    kernel: IKernelConnection,
    path: string,
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
      code: `
with open("${path}", "rb") as f:
  binary_content = f.read()

base64_content = base64.b64encode(binary_content).decode("utf-8")

comm = Comm(target_name='notebook-runner')
comm.send(data={'results': base64_content})
`,
    }).done;

    return waitForResults;
  };
}

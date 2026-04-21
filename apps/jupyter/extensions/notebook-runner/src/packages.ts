import { JupyterFrontEnd } from "@jupyterlab/application";
import { ISessionContext } from "@jupyterlab/apputils";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { Contents, ContentsManager, KernelMessage } from "@jupyterlab/services";
import {
  setupKernel,
  executePythonInKernel,
  writeJsonToVirtualFilesystem,
} from "./utils";
import { EmbeddedPythonCallbacks } from "./iframe-api";
import { LoadingStateManager } from "./loading-state";

/**
 * resolver for `_packagesReady`. it is called once the student-task notebook's
 * kernel has finished installing packages and copying the notebook content
 * into the virtual filesystem.
 */
let _setPackagesReady: () => void = () => {};
/**
 * resolver for `_packagesReady`. it is called if the student-task notebook's
 * kernel has ran into an error while installing packages and copying the notebook content
 * into the virtual filesystem.
 */
let _setPackagesFailed: (error: unknown) => void = () => {};

/**
 * this resolves when the student task notebook is ready to run cells against.
 * this exists because the install runs asynchronously in the background as
 * soon as the panel opens, but the user can click 'run all' at any point
 * during that window.
 */
const _packagesReady = new Promise<void>((resolve, reject) => {
  _setPackagesReady = resolve;
  _setPackagesFailed = reject;
});

export const waitForPackagesReady = (): Promise<void> => _packagesReady;

const studentWorkingDirectory = "/student";

const autoInstallPackages =
  (contentsManager: ContentsManager, notebookPath: string) =>
  async (kernel: IKernelConnection): Promise<void> => {
    kernel.iopubMessage.connect((_, msg) => {
      if (KernelMessage.isStatusMsg(msg)) {
        // ignore status messages
      } else if (KernelMessage.isStreamMsg(msg)) {
        console.debug(`[${kernel.id}]`, msg.content.text);
      } else if (KernelMessage.isExecuteInputMsg(msg)) {
        console.debug(
          `[${kernel.id}] Executing code (${msg.content.execution_count}):\n`,
          msg.content.code,
        );
      } else if (KernelMessage.isExecuteResultMsg(msg)) {
        console.debug(
          `[${kernel.id}] Finished executing code (${msg.content.execution_count}):`,
          msg.content.data,
        );
      } else {
        console.debug(`[${kernel.id}] IOPub message:`, msg);
      }
    });

    try {
      console.debug("Installing packages...", kernel.id);
      await installOtter(kernel);
      console.debug("Finished installing packages", kernel.id);

      const isStudentNotebook =
        // JupyterLite seems to sometimes use a leading slash and sometimes not, hence
        // the two checks here.
        notebookPath === EmbeddedPythonCallbacks.studentTaskLocation ||
        notebookPath === EmbeddedPythonCallbacks.studentTaskLocation.slice(1);

      if (isStudentNotebook) {
        console.debug(
          "Opened student notebook - copying notebook to the virtual filesystem to make tests available.",
        );

        let notebook: Contents.IModel | null = null;
        try {
          notebook = await contentsManager.get(notebookPath, { content: true });
        } catch (error) {
          throw new Error(
            `Error reading notebook at ${notebookPath} after auto-installing packages: ${JSON.stringify(error)}`,
          );
        }

        console.debug(
          `Finished reading notebook content, writing to virtual filesystem and changing working directory to ${studentWorkingDirectory}...`,
          kernel.id,
        );

        await writeJsonToVirtualFilesystem(
          kernel,
          EmbeddedPythonCallbacks.studentTaskLocation,
          notebook.content,
          studentWorkingDirectory,
        );
        console.debug(
          `Finished copying notebook to the virtual filesystem and changing working directory to ${studentWorkingDirectory}`,
          kernel.id,
        );
      }

      _setPackagesReady();
    } catch (error) {
      _setPackagesFailed(error);
      throw error;
    }
  };

const trackSession = (
  contentsManager: ContentsManager,
  sessionContext: ISessionContext,
  notebookPath: string,
): Promise<void> => {
  // start the kernel so the install runs in the background, instead of waiting for something else to trigger it.
  sessionContext.initialize().catch((error) => {
    console.error("Failed to initialize session for", notebookPath, error);
  });

  return setupKernel(
    sessionContext,
    autoInstallPackages(contentsManager, notebookPath),
  );
};

export const preInstallPackages = async (
  _app: JupyterFrontEnd,
  contentsManager: ContentsManager,
  notebookTracker: INotebookTracker,
): Promise<void> => {
  notebookTracker.forEach((panel) =>
    trackSession(contentsManager, panel.sessionContext, panel.context.path),
  );

  notebookTracker.widgetAdded.connect((_, panel) => {
    // get path of notebook
    const notebookPath = panel.context.path;

    trackSession(contentsManager, panel.sessionContext, notebookPath);
  });
};

export const installPackagesWithLoadingState = async (
  app: JupyterFrontEnd,
  contentsManager: ContentsManager,
  notebookTracker: INotebookTracker,
  loadingStateManager: LoadingStateManager,
): Promise<void> => {
  await loadingStateManager.startLoading();

  preInstallPackages(app, contentsManager, notebookTracker).catch((error) => {
    console.error("preInstallPackages failed:", error);
  });

  waitForPackagesReady()
    .then(() => loadingStateManager.finishLoading(true))
    .catch((error) => {
      console.error("Error waiting for packages to be ready:", error);
      return loadingStateManager.finishLoading(false);
    });
};

export const installOtter = async (
  kernel: IKernelConnection,
): Promise<void> => {
  console.debug("Installing Otter Grader...");
  await executePythonInKernel({
    kernel,
    code: `
import micropip
await micropip.install("/jupyter/pypi/otter_grader-6.1.3-py3-none-any.whl")
      `,

    disposeOnDone: true,
  });
};

export const installNbConvert = async (
  kernel: IKernelConnection,
): Promise<void> => {
  console.debug("Installing nbconvert...");
  await executePythonInKernel({
    kernel,
    // Micropip by default installs all dependencies including tornado which is not mandatory,
    // especially for the codepaths we need. Since trying to install tornado in jupyterlite will fail,
    // we disable dependency installation and install the required dependencies manually below.
    // The list of dependencies can be seen here: https://github.com/jupyter/nbconvert/blob/main/pyproject.toml#L28
    code: `
import micropip

await micropip.install("nbconvert", deps=False)
await micropip.install("jupyter_client", deps=False)
      `,
    disposeOnDone: true,
  });

  console.debug("Installing remaining dependencies...");
  await executePythonInKernel({
    kernel,
    code: `
import micropip

await micropip.install([
  "beautifulsoup4",
  "bleach[css]!=5.0.0",
  "defusedxml",
  "importlib_metadata>=3.6",
  "jinja2>=3.0",
  "jupyter_core>=4.7",
  "jupyterlab_pygments",
  "MarkupSafe>=2.0",
  "mistune>=2.0.3,<4",
  "nbformat>=5.7",
  "packaging",
  "pandocfilters>=1.4.1",
  "pygments>=2.4.1",
  "traitlets>=5.1",
  "tinycss2"
])
`,
    disposeOnDone: true,
  });

  console.debug("Creating nbclient mock...");
  await executePythonInKernel(
    // make nbclient.exceptions available, copied from https://gist.github.com/bollwyvl/6b3cb4c46b1764c6d9ae1e5831f86d7a#file-nbconvert-in-jupyterlite-ipynb
    {
      kernel,
      code: `
import sys, types

noop = lambda *args, **kwargs: dict(args=args, kwargs=kwargs)
nbclient = types.ModuleType("nbclient")
nbclient.NotebookClient = nbclient.execute = noop
sys.modules["nbclient"] = nbclient
nbclient_exceptions = types.ModuleType("nbclient.exceptions")
nbclient_exceptions.CellExecutionError = noop
sys.modules["nbclient.exceptions"] = nbclient_exceptions
      `,
      disposeOnDone: true,
    },
  );

  console.debug("Patching nbclient for JupyterLite...");
  await executePythonInKernel({
    kernel,
    // make nbconvert.preprocessors available without importing execute, copied from https://gist.github.com/bollwyvl/6b3cb4c46b1764c6d9ae1e5831f86d7a#file-nbconvert-in-jupyterlite-ipynb
    // this is because we cannot import the execute module in JupyterLite
    code: `
from pathlib import Path

preprocessors = Path("/lib/python3.13/site-packages/nbconvert/preprocessors/__init__.py")
preprocessors.write_text(
  preprocessors.read_text().replace('\\nfrom .execute', '\\n# from .execute')
)
`,
    disposeOnDone: true,
  });
};

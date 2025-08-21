import { JupyterFrontEnd } from "@jupyterlab/application";
import { ISessionContext } from "@jupyterlab/apputils";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { Contents, ContentsManager, KernelMessage } from "@jupyterlab/services";
import { addKernelListeners, writeJsonToVirtualFilesystem } from "./utils";
import { EmbeddedPythonCallbacks } from "./iframe-api";

const autoInstallPackages =
  (contentsManager: ContentsManager, notebookPath: string) =>
  async (kernel: IKernelConnection): Promise<void> => {
    kernel.iopubMessage.connect((_, msg) => {
      // ignore status messages
      if (KernelMessage.isStatusMsg(msg)) {
        return;
      } else if (KernelMessage.isStreamMsg(msg)) {
        console.log(`[${kernel.id}]`, msg.content.text);
        return;
      } else if (KernelMessage.isExecuteInputMsg(msg)) {
        console.debug(
          `[${kernel.id}] Executing code (${msg.content.execution_count}):\n`,
          msg.content.code,
        );
        return;
      } else if (KernelMessage.isExecuteResultMsg(msg)) {
        console.debug(
          `[${kernel.id}] Finished executing code (${msg.content.execution_count}):`,
          msg.content.data,
        );
      }

      console.debug(`[${kernel.id}] IOPub message:`, msg);
    });

    console.debug("Installing packages...", kernel.id);
    await importBasePackages(kernel);
    await installOtter(kernel);
    console.debug("Finished installing packages", kernel.id);

    if (
      notebookPath === EmbeddedPythonCallbacks.studentTaskLocation ||
      notebookPath === EmbeddedPythonCallbacks.studentTaskLocation.slice(1)
    ) {
      console.debug(
        "Opened student notebook - copying notebook to the virtual filesystem to make tests available..",
      );

      let notebook: Contents.IModel | null = null;
      try {
        notebook = await contentsManager.get(notebookPath, { content: true });
      } catch (error) {
        throw new Error("Error reading ran notebook:" + error);
      }

      await writeJsonToVirtualFilesystem(
        kernel,
        EmbeddedPythonCallbacks.studentTaskLocation,
        notebook.content,
      );
      console.debug("Finished copying notebook to the virtual filesystem");

      await kernel.requestExecute({
        code: `os.chdir("/student")`,
      }).done;
    }
  };

const trackSession = (
  contentsManager: ContentsManager,
  sessionContext: ISessionContext,
  notebookPath: string,
): Promise<void> =>
  addKernelListeners(
    sessionContext,
    autoInstallPackages(contentsManager, notebookPath),
  );

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

export const importBasePackages = async (
  kernel: IKernelConnection,
): Promise<void> => {
  console.log("Importing builtin libraries..");
  await kernel.requestExecute(
    {
      code: `
        import micropip, sys, types, os, tempfile, asyncio, shutil, base64
        from urllib.parse import unquote
        from pathlib import Path
      `,
    },
    true,
  ).done;
};

export const installOtter = async (
  kernel: IKernelConnection,
): Promise<void> => {
  console.log("Installing Otter Grader..");
  await kernel.requestExecute(
    {
      code: `
await micropip.install("/jupyter/pypi/otter_grader-6.1.3-py3-none-any.whl")
      `,
    },
    true,
  ).done;
};

export const installNbConvert = async (
  kernel: IKernelConnection,
): Promise<void> => {
  console.debug("Installing nbconvert..");
  await kernel.requestExecute(
    {
      code: `
        # Micropip by default installs all dependencies including tornado which is not mandatory,
        # especially for the codepaths we need.
        # The list of dependencies can be seen here: https://github.com/jupyter/nbconvert/blob/main/pyproject.toml#L28
        
        await micropip.install("nbconvert", deps=False)
        await micropip.install("jupyter_client", deps=False)
      `,
    },
    true,
  ).done;

  console.debug("Installing remaining dependencies..");
  await kernel.requestExecute(
    {
      code: `
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
  #"nbclient>=0.5.0",
  "nbformat>=5.7",
  "packaging",
  "pandocfilters>=1.4.1",
  "pygments>=2.4.1",
  "traitlets>=5.1",
  "tinycss2"
])

await micropip.install([
  #"jupyter_client>=6.1.12",
  "jupyter_core>=4.12,!=5.0.*",
  "nbformat>=5.1",
  "traitlets>=5.4",
])
`,
    },
    true,
  ).done;

  console.log("Creating nbclient mock...");
  await kernel.requestExecute(
    {
      code: `
# make nbclient.exceptions available, copied from https://gist.github.com/bollwyvl/6b3cb4c46b1764c6d9ae1e5831f86d7a#file-nbconvert-in-jupyterlite-ipynb
noop = lambda *args, **kwargs: dict(args=args, kwargs=kwargs)
nbclient = types.ModuleType("nbclient")
nbclient.NotebookClient = nbclient.execute = noop
sys.modules["nbclient"] = nbclient
nbclient_exceptions = types.ModuleType("nbclient.exceptions")
nbclient_exceptions.CellExecutionError = noop
sys.modules["nbclient.exceptions"] = nbclient_exceptions
      `,
    },
    true,
  ).done;

  console.log("Patching nbclient for JupyterLite..");
  await kernel.requestExecute(
    {
      code: `
# make nbconvert.preprocessors available without importing execute, copied from https://gist.github.com/bollwyvl/6b3cb4c46b1764c6d9ae1e5831f86d7a#file-nbconvert-in-jupyterlite-ipynb
# this is because we cannot import the execute module in JupyterLite
preprocessors = Path("/lib/python3.12/site-packages/nbconvert/preprocessors/__init__.py")
preprocessors.write_text(
    preprocessors.read_text().replace('\\nfrom .execute', '\\n# from .execute')
)
`,
    },
    true,
  ).done;
};

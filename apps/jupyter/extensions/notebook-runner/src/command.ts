import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { NotebookActions, NotebookPanel } from "@jupyterlab/notebook";
import { Contents, ContentsManager } from "@jupyterlab/services";
import { NotebookRunnerState } from "./notebook-runner-state";
import {
  executePythonInKernel,
  withTimeout,
  writeJsonToVirtualFilesystem,
} from "./utils";
import { OtterKernelNotReadyError } from "./errors/kernel-errors";

const logModule = "[Jupyter][command]";

/**
 * The notebook is opened against the already-prepared otter kernel, so nothing
 * here needs to boot a kernel; this only has to outlast opening a document.
 */
const notebookReadyTimeoutMs = 60_000;

export const runAssignCommand = "notebook-runner:run-assign";
export const runGradingCommand = "notebook-runner:run-grading";
export const runAllCellsCommand = "notebook-runner:run-all-cells";

export enum CommandType {
  RunNotebook = "run_notebook",
}

export const executeRunNotebookCommand = async (
  app: JupyterFrontEnd,
  state: NotebookRunnerState,
  notebookPanel: NotebookPanel | null,
  contentsManager: ContentsManager,
  documentManager: IDocumentManager,
  notebookPath: string,
  binaryResultsPath: string,
): Promise<void> => {
  // Take the otter kernel *before* opening the notebook so that it can be
  // named as the panel's kernel right away. Opened without one, the panel
  // auto-starts a kernel of its own - a second full Pyodide boot, several
  // minutes of it - which the changeKernel call below then discards anyway.
  // Worse, the wait for that kernel is unbounded: `sessionContext.ready` never
  // settles when the session context cannot pick a kernel, so a student's
  // submission would sit on a dead spinner forever.
  const otterKernel = await state.getOtterKernel();
  console.debug(`${logModule} Reusing existing otter kernel:`, otterKernel);

  console.debug(`${logModule} Opening notebook at path:`, notebookPath);

  state.allowNextNotebookInParallel = true;
  const newNotebookPanel = documentManager.open(
    notebookPath,
    "Notebook",
    { id: otterKernel.id, name: otterKernel.name },
    {
      activate: false,
      ref: null,
    },
  ) as NotebookPanel | undefined;

  if (!newNotebookPanel) {
    throw new Error(`Notebook at path ${notebookPath} could not be opened`);
  }

  // focus the old notebook
  if (notebookPanel) {
    app.shell.activateById(notebookPanel.id);
  }

  // Make sure the user does not see the new notebook panel
  newNotebookPanel.hide();

  // Wait for it to be ready.
  //
  // Bounded on purpose: `sessionContext.ready` is one of the promises that is
  // never settled when the session context cannot settle on a kernel, and this
  // is the last wait between a student pressing Submit and their work being
  // graded. Unbounded, it leaves them on a spinner that never stops and offers
  // no way out; bounded, the failure reaches them as a message they can act on.
  await withTimeout(
    Promise.all([
      newNotebookPanel.context.ready,
      newNotebookPanel.sessionContext.ready,
    ]),
    notebookReadyTimeoutMs,
    () => {
      console.error(
        `${logModule} Notebook at ${notebookPath} was not ready after ${notebookReadyTimeoutMs}ms`,
      );

      return new OtterKernelNotReadyError();
    },
  );

  // copying the notebook to the virtual filesystem on the kernel in the same location
  console.debug(
    `${logModule} Copying notebook to virtual filesystem before running`,
  );
  let notebook: Contents.IModel | null = null;
  try {
    notebook = await contentsManager.get(notebookPath, { content: true });
  } catch (error) {
    throw new Error(
      `Error reading notebook at ${notebookPath} before executing all cells: ${JSON.stringify(error)}`,
    );
  }

  await writeJsonToVirtualFilesystem(
    otterKernel,
    notebookPath,
    notebook.content,
  );

  await newNotebookPanel.sessionContext.changeKernel({
    id: otterKernel.id,
    name: otterKernel.name,
  });

  // get parent directory of the notebook
  const parentDir = notebookPath.split("/").slice(0, -1).join("/");
  console.debug(`${logModule} Change working directory to `, parentDir);

  await executePythonInKernel({
    kernel: otterKernel,
    code: `
import os
os.chdir("${parentDir}")

from otter import Notebook as nb
nb.init_grading_mode("./tests")
`,
  });

  // Run all cells silently
  console.debug(
    `${logModule} Running all cells in the new notebook:`,
    newNotebookPanel.title.label,
  );

  await NotebookActions.runAll(
    newNotebookPanel.content,
    newNotebookPanel.context.sessionContext,
  );

  console.debug(
    `${logModule} All cells executed in the new notebook. Now running tests...`,
  );

  await executePythonInKernel({
    kernel: otterKernel,
    code: `
from otter.execute import Checker
from glob import glob
for t in glob("./tests/*.py"):
  Checker.check_if_not_already_checked(t)

from otter.test_files import GradingResults
results = GradingResults(Checker.get_results())

import pickle
with open("${binaryResultsPath}", "wb") as f:
  pickle.dump(results, f)
    `,
  });

  console.debug(`${logModule} Tests executed, saving notebook...`);

  await newNotebookPanel.context.save();

  console.debug(`${logModule} Notebook saved. Closing notebook...`);

  const waitUntilClosed = new Promise<void>((resolve) => {
    newNotebookPanel.disposed.connect(() => {
      console.debug(`${logModule} Closed notebook that was run`);
      resolve();
    });
  });

  newNotebookPanel.close();

  // wait until the widget is closed
  await waitUntilClosed;

  console.debug(`${logModule} Notebook closed.`);
};

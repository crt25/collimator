import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { NotebookActions, NotebookPanel } from "@jupyterlab/notebook";
import { Contents, ContentsManager } from "@jupyterlab/services";
import { NotebookRunnerState } from "./notebook-runner-state";
import { writeJsonToVirtualFilesystem } from "./utils";

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
  console.debug("Opening notebook at path:", notebookPath);

  state.allowNextNotebookInParallel = true;
  const newNotebookPanel = documentManager.open(
    notebookPath,
    "Notebook",
    {},
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

  // Wait for it to be ready
  await newNotebookPanel.context.ready;
  await newNotebookPanel.sessionContext.ready;

  // Connect to existing kernel if available
  const otterKernel = await state.getOtterKernel();
  console.debug("Reusing existing otter kernel:", otterKernel);

  // copying the notebook to the virtual filesystem on the kernel in the same location
  console.debug("Copying notebook to virtual filesystem before running");
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
  console.debug("Change working directory to ", parentDir);

  await otterKernel.requestExecute({
    code: `
import os
os.chdir("${parentDir}")

from otter import Notebook as nb
nb.init_grading_mode("./tests")
`,
  }).done;

  // Run all cells silently
  console.debug(
    "Running all cells in the new notebook:",
    newNotebookPanel.title.label,
  );

  await NotebookActions.runAll(
    newNotebookPanel.content,
    newNotebookPanel.context.sessionContext,
  );

  console.debug("All cells executed in the new notebook. Now running tests...");

  await otterKernel.requestExecute({
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
  }).done;

  console.debug("Tests executed, saving notebook...");

  await newNotebookPanel.context.save();

  console.debug("Notebook saved. Closing notebook...");

  const waitUntilClosed = new Promise<void>((resolve) => {
    newNotebookPanel.disposed.connect(() => {
      console.debug("Closed notebook that was run");
      resolve();
    });
  });

  newNotebookPanel.close();

  // wait until the widget is closed
  await waitUntilClosed;

  console.debug("Notebook closed.");
};

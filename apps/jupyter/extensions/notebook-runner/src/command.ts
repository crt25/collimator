import { Contents, ContentsManager } from "@jupyterlab/services";
import { IKernelConnection } from "@jupyterlab/services/lib/kernel/kernel";
import { executePythonInKernel, writeJsonToVirtualFilesystem } from "./utils";

const logModule = "[Jupyter][command]";

export const runAssignCommand = "notebook-runner:run-assign";
export const runGradingCommand = "notebook-runner:run-grading";
export const runAllCellsCommand = "notebook-runner:run-all-cells";

export enum CommandType {
  RunNotebook = "run_notebook",
}

interface NotebookCell {
  cell_type: string;
  source: string | string[];
}

const isNotebookContent = (
  content: unknown,
): content is { cells: NotebookCell[] } =>
  typeof content === "object" &&
  content !== null &&
  Array.isArray((content as { cells?: unknown }).cells);

/**
 * Run a single notebook code cell against the grading kernel.
 *
 * This is the panel-free equivalent of one step of `NotebookActions.runAll`:
 * the cell is sent as its own top-level `execute_request`, so it runs in the
 * kernel's user namespace exactly as if a person had run the cell — and, just
 * as importantly, in the *same* namespace the otter checks are later evaluated
 * against.
 *
 * Unlike `executePythonInKernel`, an error in the cell is deliberately not
 * thrown: a student cell that raises is a failing answer, not a broken run, so
 * — exactly like "Run All Cells" in the notebook UI — execution has to carry on
 * to the remaining cells and the otter checks.
 */
const runNotebookCodeCell = async (
  kernel: IKernelConnection,
  source: string,
): Promise<void> => {
  await kernel.requestExecute({ code: source }).done;
};

/**
 * Execute a notebook against the already-prepared otter kernel and leave the
 * accumulated grading results pickled at `binaryResultsPath`.
 *
 * No notebook panel is opened. Grading only ever needed the notebook's code to
 * run in the grading kernel's namespace so that the embedded `grader.check(...)`
 * calls record their results; opening a hidden `DocumentWidget` to achieve that
 * is what used to hang. Under headless JupyterLite a panel that adopts an
 * existing kernel never settles its `sessionContext.ready`, so the wait between
 * a student pressing Submit and their work being graded never returned. Running
 * the cells directly on the kernel removes that fragile widget entirely.
 *
 * The graceful-failure guarantee is unchanged: the kernel handed in here is
 * obtained through `NotebookRunnerState.getOtterKernel`, whose wait is bounded
 * and surfaces `OtterKernelNotReadyError` to the user if preparation stalls.
 */
export const executeRunNotebookCommand = async (
  kernel: IKernelConnection,
  contentsManager: ContentsManager,
  notebookPath: string,
  binaryResultsPath: string,
): Promise<void> => {
  // Read the notebook that the grade command has just saved to the browser
  // contents manager, and give the kernel its own copy on the virtual
  // filesystem to grade against.
  let notebook: Contents.IModel;
  try {
    notebook = await contentsManager.get(notebookPath, { content: true });
  } catch (error) {
    throw new Error(
      `Error reading notebook at ${notebookPath} before executing all cells: ${JSON.stringify(error)}`,
    );
  }

  await writeJsonToVirtualFilesystem(kernel, notebookPath, notebook.content);

  if (!isNotebookContent(notebook.content)) {
    throw new Error(`Notebook at ${notebookPath} has no cells to execute`);
  }

  // Enter otter grading mode from the notebook's own directory so that the
  // `grader.check(...)` calls embedded in the cells resolve their tests against
  // the ones unpacked next to it.
  const parentDir = notebookPath.split("/").slice(0, -1).join("/");
  console.debug(`${logModule} Change working directory to`, parentDir);

  await executePythonInKernel({
    kernel,
    code: `
import os
os.chdir("${parentDir}")

from otter import Notebook as nb
nb.init_grading_mode("./tests")
`,
  });

  console.debug(`${logModule} Running notebook cells for`, notebookPath);

  for (const cell of notebook.content.cells) {
    if (cell.cell_type !== "code") {
      continue;
    }

    const source = Array.isArray(cell.source)
      ? cell.source.join("")
      : cell.source;

    if (source.trim().length === 0) {
      continue;
    }

    await runNotebookCodeCell(kernel, source);
  }

  console.debug(`${logModule} All cells executed. Now running tests...`);

  // Run any test the notebook did not already check, then pickle the
  // accumulated results for the otter run to reuse as its precomputed results.
  await executePythonInKernel({
    kernel,
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

  console.debug(
    `${logModule} Tests executed, results written to`,
    binaryResultsPath,
  );
};

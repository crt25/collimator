import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker, NotebookPanel } from "@jupyterlab/notebook";
import { Contents, ContentsManager } from "@jupyterlab/services";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { NotebookRunnerState } from "../notebook-runner-state";
import { executeRunNotebookCommand, runGradingCommand } from "../command";
import { EmbeddedPythonCallbacks } from "../iframe-api";
import { OtterGradingResults } from "../grading-results";
import {
  writeBinaryToVirtualFilesystem,
  writeJsonToVirtualFilesystem,
} from "../utils";

const binaryResultsPath = "/results.pkl";

const createOnNewNotebookListener =
  (app: JupyterFrontEnd, state: NotebookRunnerState) =>
  async (
    _notebookTracker: INotebookTracker,
    notebookPanel: NotebookPanel,
  ): Promise<void> => {
    // close all other notebooks
    if (!state.allowNextNotebookInParallel) {
      const widgets = app.shell.widgets("main");

      for (const widget of widgets) {
        if (widget instanceof NotebookPanel && widget !== notebookPanel) {
          console.log("Closing notebook:", widget);
          await widget.context.save();
          widget.close();
        }
      }
    }
    state.allowNextNotebookInParallel = false;
  };

export const registerGradeCommand = (
  state: NotebookRunnerState,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  contentsManager: ContentsManager,
  documentManager: IDocumentManager,
): void => {
  app.commands.addCommand(runGradingCommand, {
    label: "Run Grading",
    execute: async () => {
      console.debug(`Waiting for otter session kernel to be available`);
      const kernel = await state.getOtterKernel();

      console.debug(`Transferring autograder to virtual filesystem`);

      let autograder: Contents.IModel | null = null;
      try {
        autograder = await contentsManager.get(
          EmbeddedPythonCallbacks.autograderLocation,
          { content: true },
        );
      } catch (error) {
        throw new Error("Error reading autograder:" + error);
      }

      await writeBinaryToVirtualFilesystem(
        kernel,
        EmbeddedPythonCallbacks.autograderLocation,
        autograder.content,
      );

      console.debug(`Unpack tests from autograder.zip to student/`);

      await kernel.requestExecute({
        code: `
import os
import zipfile

autograder_path = "${EmbeddedPythonCallbacks.autograderLocation}"
student_path = "/student"

with zipfile.ZipFile(autograder_path, 'r') as zip_ref:
    zip_ref.extractall(student_path)
`,
      }).done;

      console.debug(`Executing notebook before submitting it for grading`);

      await executeRunNotebookCommand(
        app,
        state,
        notebookTracker.currentWidget,
        contentsManager,
        documentManager,
        EmbeddedPythonCallbacks.studentTaskLocation,
        binaryResultsPath,
      );

      await kernel.requestExecute({
        code: `
          
          `,
      }).done;

      // read ran notebook and autograder
      let ranNotebook: Contents.IModel | null = null;
      try {
        ranNotebook = await contentsManager.get(
          EmbeddedPythonCallbacks.studentTaskLocation,
          { content: true },
        );
      } catch (error) {
        throw new Error("Error reading ran notebook:" + error);
      }

      console.log("Transfering files to virtual filesystem");

      await writeJsonToVirtualFilesystem(
        kernel,
        EmbeddedPythonCallbacks.studentTaskLocation,
        ranNotebook.content,
      );

      console.log(
        "Running notebook with autograder:",
        EmbeddedPythonCallbacks.autograderLocation,
      );

      const run = kernel.requestExecute({
        code: `
          run(
            "${EmbeddedPythonCallbacks.studentTaskLocation}",
            autograder="${EmbeddedPythonCallbacks.autograderLocation}",
            no_logo=True,
            debug=True,
            log_server=False,
            precomputed_results="${binaryResultsPath}",
            output_dir="/"
          )
          `,
      });

      try {
        await run.done;
      } catch (error) {
        console.error("Error running notebook:", error);
      }

      console.debug("Transfer results back from the virtual fileystem..");

      return state.readJsonFromVirtualFilesystem<OtterGradingResults>(
        kernel,
        "/results.json",
      );
    },
  });

  // add event listener to run when a notebook is opened
  notebookTracker.widgetAdded.connect(createOnNewNotebookListener(app, state));
};

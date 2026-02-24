import {JupyterFrontEnd} from "@jupyterlab/application";
import {INotebookTracker, NotebookPanel} from "@jupyterlab/notebook";
import {Contents, ContentsManager} from "@jupyterlab/services";
import {IDocumentManager} from "@jupyterlab/docmanager";
import {NotebookRunnerState} from "../notebook-runner-state";
import {executeRunNotebookCommand, runGradingCommand} from "../command";
import {EmbeddedPythonCallbacks} from "../iframe-api";
import {OtterGradingResults} from "../grading-results";
import {executePythonInKernel, writeBinaryToVirtualFilesystem, writeJsonToVirtualFilesystem,} from "../utils";
import {DEBUG_NOTEBOOK_RUNNER} from "../constants";
import {copyRequiredFoldersToKernel, handleOtterCommandError, kernelPaths,} from "./helper";

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
                        console.debug("Closing notebook: ", widget);
                        await widget.context.save();
                        await widget.sessionContext.shutdown();
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
        isVisible: () => DEBUG_NOTEBOOK_RUNNER,
        execute: async (): Promise<OtterGradingResults> => {
            try {
                console.debug("Saving all open notebooks...");
                const widgets = app.shell.widgets("main");

                const savePromises: Promise<void>[] = [];

                for (const widget of widgets) {
                    if (widget instanceof NotebookPanel) {
                        savePromises.push(widget.context.save());
                    }
                }
                await Promise.all(savePromises);

                console.debug(`Waiting for otter session kernel to be available`);
                const kernel = await state.getOtterKernel();

                console.debug(`Transferring autograder for grading...`);

                let autograder: Contents.IModel | null = null;
                try {
                    autograder = await contentsManager.get(
                        EmbeddedPythonCallbacks.autograderLocation,
                        {content: true},
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

                await executePythonInKernel({
                    kernel,
                    code: `
import os
import zipfile

autograder_path = "${EmbeddedPythonCallbacks.autograderLocation}"
student_path = "/student"

with zipfile.ZipFile(autograder_path, 'r') as zip_ref:
  zip_ref.extractall(student_path)
`,
                });

                console.debug(`Executing notebook before submitting it for grading`);

                await executeRunNotebookCommand(
                    app,
                    state,
                    notebookTracker.currentWidget,
                    contentsManager,
                    documentManager,
                    EmbeddedPythonCallbacks.studentTaskLocation,
                    kernelPaths.results,
                );

                // read the notebook that has been executed and autograder
                let executedNotebook: Contents.IModel | null = null;
                try {
                    executedNotebook = await contentsManager.get(
                        EmbeddedPythonCallbacks.studentTaskLocation,
                        {content: true},
                    );
                } catch (error) {
                    throw new Error(
                        `Error reading notebook at ${EmbeddedPythonCallbacks.studentTaskLocation} when running otter grade: ${JSON.stringify(error)}`,
                    );
                }

                console.debug(
                    `Transfering executed notebook to virtual filesystem to '${EmbeddedPythonCallbacks.studentTaskLocation}'`,
                );

                await writeJsonToVirtualFilesystem(
                    kernel,
                    EmbeddedPythonCallbacks.studentTaskLocation,
                    executedNotebook.content,
                );

                console.debug(
                    "Running notebook with autograder: ",
                    EmbeddedPythonCallbacks.autograderLocation,
                );

                await copyRequiredFoldersToKernel(kernel, contentsManager);

                const run = executePythonInKernel({
                    kernel,
                    code: `
run(
  "${EmbeddedPythonCallbacks.studentTaskLocation}",
  autograder="${EmbeddedPythonCallbacks.autograderLocation}",
  no_logo=True,
  debug=True,
  log_server=False,
  precomputed_results="${kernelPaths.results}",
  output_dir="/"
)
          `,
                });

                try {
                    await run;
                } catch (error) {
                    console.error("Error running notebook:", error);
                }

                console.debug("Retrieving results...");

                const results =
                    await state.readJsonFromVirtualFilesystem<OtterGradingResults>(
                        kernel,
                        "/results.json",
                    );

                console.debug("Grading results:", results);

                return results;
            } catch (error) {
                handleOtterCommandError(error);

                // Propagate error to caller (usually iframe API)
                throw error;
            }
        },
    });

    // add event listener to run when a notebook is opened
    notebookTracker.widgetAdded.connect(createOnNewNotebookListener(app, state));
};

import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker, NotebookPanel } from "@jupyterlab/notebook";
import { ContentsManager, Contents } from "@jupyterlab/services";
import { NotebookRunnerState } from "../notebook-runner-state";
import { runAssignCommand } from "../command";
import { EmbeddedPythonCallbacks } from "../iframe-api";
import { executePythonInKernel, writeJsonToVirtualFilesystem } from "../utils";
import { CannotReadNotebookException } from "../errors/otter-errors";
import { DEBUG_NOTEBOOK_RUNNER } from "../constants";
import { copyRequiredFoldersToKernel, handleOtterCommandError } from "./helper";

export const registerAssignCommand = (
  state: NotebookRunnerState,
  app: JupyterFrontEnd,
  _notebookTracker: INotebookTracker,
  contentsManager: ContentsManager,
): void => {
  app.commands.addCommand(runAssignCommand, {
    label: "Run Assign",
    isVisible: () => (DEBUG_NOTEBOOK_RUNNER ? true : false),
    execute: async () => {
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

        console.debug(`Generating student task and autograder...`);

        // read notebook template
        let template: Contents.IModel | null = null;
        try {
          template = await contentsManager.get(
            EmbeddedPythonCallbacks.taskTemplateLocation,
            { content: true },
          );
        } catch (error) {
          console.debug(
            `Cannot read notebook: ${EmbeddedPythonCallbacks.taskTemplateLocation}`,
            error,
          );
          throw new CannotReadNotebookException(
            EmbeddedPythonCallbacks.taskTemplateLocation,
          );
        }

        await writeJsonToVirtualFilesystem(
          kernel,
          EmbeddedPythonCallbacks.taskTemplateLocation,
          template.content,
        );

        await copyRequiredFoldersToKernel(kernel, contentsManager);

        await executePythonInKernel({
          kernel,
          code: `
assign(
  master = "${EmbeddedPythonCallbacks.taskTemplateLocation}",
  result = "/",
  no_pdfs = True,
  debug = True,
  no_run_tests = True,
)
          `,
        });

        console.debug("Retrieving generated files...");

        await executePythonInKernel({
          kernel,
          code: `
def first_file_with_extension(directory, extension):
  if not extension.startswith("."):
    extension = "." + extension

  for file in Path(directory).iterdir():
    if file.is_file() and file.suffix == extension:
      return str(file)
  return None  
      `,
        });

        console.debug(
          "Looking for first file with extension .zip in /autograder",
        );

        // there should now be an 'autograder' directory containing a zip file with a random name
        // -> make it deterministic
        await executePythonInKernel({
          kernel,
          code: `
import shutil

shutil.move(
  first_file_with_extension("/autograder", ".zip"),
  "${EmbeddedPythonCallbacks.autograderLocation}"
)
      `,
        });

        console.debug("Retrieving autograder...");

        await app.serviceManager.contents.save("/autograder", {
          type: "directory",
          name: "autograder",
        });

        await app.serviceManager.contents.save("/student", {
          type: "directory",
          name: "student",
        });

        const autograder = await state.readBinaryFromVirtualFilesystem(
          kernel,
          EmbeddedPythonCallbacks.autograderLocation,
        );

        await app.serviceManager.contents.save(
          EmbeddedPythonCallbacks.autograderLocation,
          {
            type: "file",
            format: "base64",
            content: autograder,
          },
        );

        console.debug("Retrieving student notebook...");

        // and a 'student' directory containing a jupyter notebook.
        const studentNotebook =
          await state.readJsonFromVirtualFilesystem<unknown>(
            kernel,
            EmbeddedPythonCallbacks.studentTaskLocation,
          );

        await app.serviceManager.contents.save(
          EmbeddedPythonCallbacks.studentTaskLocation,
          {
            type: "file",
            format: "json",
            content: studentNotebook,
          },
        );
      } catch (error) {
        handleOtterCommandError(error);

        // Propagate error to caller (usually iframe API)
        throw error;
      }
    },
  });
};

import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker } from "@jupyterlab/notebook";
import { ContentsManager, Contents } from "@jupyterlab/services";
import { NotebookRunnerState } from "../notebook-runner-state";
import { runAssignCommand } from "../command";
import { EmbeddedPythonCallbacks } from "../iframe-api";
import { writeJsonToVirtualFilesystem } from "../utils";

export const registerAssignCommand = (
  state: NotebookRunnerState,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  contentsManager: ContentsManager,
): void => {
  app.commands.addCommand(runAssignCommand, {
    label: "Run Assign",
    execute: async () => {
      console.debug(`Waiting for otter session kernel to be available`);
      const kernel = await state.getOtterKernel();

      console.debug(`Generating student task and autograder..`);

      // read notebook template
      let template: Contents.IModel | null = null;
      try {
        template = await contentsManager.get(
          EmbeddedPythonCallbacks.taskTemplateLocation,
          { content: true },
        );
      } catch (error) {
        throw new Error("Error reading ran notebook:" + error);
      }

      await writeJsonToVirtualFilesystem(
        kernel,
        EmbeddedPythonCallbacks.taskTemplateLocation,
        template.content,
      );

      await kernel.requestExecute({
        code: `
          assign(
              master = "${EmbeddedPythonCallbacks.taskTemplateLocation}",
              result = "/",
              no_pdfs = True,
              debug = True,
              no_run_tests = True,
          )
          `,
      }).done;

      console.debug(
        "Transfering generated files back from the virtual filesystem..",
      );

      await kernel.requestExecute({
        code: `
        def first_file_with_extension(directory, extension):
          if not extension.startswith("."):
              extension = "." + extension

          for file in Path(directory).iterdir():
              if file.is_file() and file.suffix == extension:
                  return str(file)
          return None  
      `,
      }).done;

      console.debug(
        "Looking for first file with extension .zip in /autograder",
      );

      // there should now be an 'autograder' directory containing a zip file with a random name
      // -> make it deterministic
      await kernel.requestExecute({
        code: `shutil.move(
          first_file_with_extension("/autograder", ".zip"),
          "${EmbeddedPythonCallbacks.autograderLocation}"
        )`,
      }).done;

      console.debug(
        "Transferring autograder back from the virtual filesystem..",
      );

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

      console.debug(
        "Transferring student notebook back from the virtual filesystem..",
      );

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
    },
  });
};

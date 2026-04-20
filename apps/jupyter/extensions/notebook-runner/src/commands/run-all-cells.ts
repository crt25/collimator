import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker, NotebookActions } from "@jupyterlab/notebook";
import { NotebookRunnerState } from "../notebook-runner-state";
import { runAllCellsCommand } from "../command";
import { waitForPackagesReady } from "../packages";

export const registerRunAllCellsCommand = (
  state: NotebookRunnerState,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
): void => {
  app.commands.addCommand(runAllCellsCommand, {
    iconClass: "fa fa-play-circle",
    execute: async () => {
      const currentNotebook = notebookTracker.currentWidget;

      if (currentNotebook === null) {
        console.warn("No active notebook to run cells in.");
        return;
      }

      console.debug(
        "awaiting for packages to be ready before running cells...",
      );

      try {
        await waitForPackagesReady();
      } catch (error) {
        console.error("Cannot run cells, package installation failed:", error);
        return;
      }

      console.debug("packages are ready, running cells...");

      await NotebookActions.runAll(
        currentNotebook.content,
        currentNotebook.context.sessionContext,
      );
      console.debug("finished running cells");
    },
  });
};

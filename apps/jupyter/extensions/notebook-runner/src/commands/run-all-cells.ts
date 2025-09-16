import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker, NotebookActions } from "@jupyterlab/notebook";
import { NotebookRunnerState } from "../notebook-runner-state";
import { runAllCellsCommand } from "../command";

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

      await NotebookActions.runAll(
        currentNotebook.content,
        currentNotebook.context.sessionContext,
      );
    },
  });
};

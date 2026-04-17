import { JupyterFrontEnd } from "@jupyterlab/application";
import { INotebookTracker, NotebookActions } from "@jupyterlab/notebook";
import { NotebookRunnerState } from "../notebook-runner-state";
import { runAllCellsCommand } from "../command";
import { waitForPackagesReady } from "../packages";
import { sendMessage } from "../send-message";
import { AppCrtIframeApi, ToastType } from "../iframe-rpc/src";

export const registerRunAllCellsCommand = (
  state: NotebookRunnerState,
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  sendRequest: AppCrtIframeApi["sendRequest"],
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

      await sendMessage(
        "Running Cells",
        "Please wait while the required packages are being set up...",
        ToastType.Info,
        sendRequest,
      );

      await waitForPackagesReady();
      console.debug("packages are ready, running cells...");

      await NotebookActions.runAll(
        currentNotebook.content,
        currentNotebook.context.sessionContext,
      );
      console.debug("finished running cells");
    },
  });
};

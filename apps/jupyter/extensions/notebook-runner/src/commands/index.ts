import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { ContentsManager } from "@jupyterlab/services";
import { NotebookRunnerState } from "../notebook-runner-state";
import { AppCrtIframeApi } from "../iframe-rpc/src";
import { registerAssignCommand } from "./assign";
import { registerGradeCommand } from "./grade";
import { registerRunAllCellsCommand } from "./run-all-cells";

export const registerCommands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  contentsManager: ContentsManager,
  documentManager: IDocumentManager,
  platform: AppCrtIframeApi,
): void => {
  const state = new NotebookRunnerState(app, documentManager, notebookTracker);

  registerAssignCommand(state, app, notebookTracker, contentsManager);
  registerGradeCommand(
    state,
    app,
    notebookTracker,
    contentsManager,
    documentManager,
  );
  registerRunAllCellsCommand(
    state,
    app,
    notebookTracker,
    platform.sendRequest.bind(platform),
  );
};

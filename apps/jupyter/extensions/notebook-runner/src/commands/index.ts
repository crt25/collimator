import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { ContentsManager } from "@jupyterlab/services";
import { NotebookRunnerState } from "../notebook-runner-state";
import { registerAssignCommand } from "./assign";
import { registerGradeCommand } from "./grade";

export const registerCommands = (
  app: JupyterFrontEnd,
  notebookTracker: INotebookTracker,
  contentsManager: ContentsManager,
  documentManager: IDocumentManager,
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
};

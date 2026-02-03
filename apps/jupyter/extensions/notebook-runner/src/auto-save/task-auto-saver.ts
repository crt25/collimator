import {
  INotebookModel,
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";

import { AppCrtIframeApi } from "../iframe-rpc/src";
import { sendTaskSolution } from "./send-task-solution";

export type ExecutionScheduledCallback = Parameters<
  typeof NotebookActions.executionScheduled.connect
>[0];

export class TaskAutoSaver {
  private readonly contentChangeTimers = new Map<
    INotebookModel,
    NodeJS.Timeout
  >();
  private readonly executionListeners = new Map<
    INotebookModel,
    ExecutionScheduledCallback
  >();
  public static readonly debounceInterval = 30000;

  constructor(
    notebookTracker: INotebookTracker,
    private readonly sendRequest: AppCrtIframeApi["sendRequest"],
  ) {
    notebookTracker.widgetAdded.connect((sender, panel: NotebookPanel) => {
      this.registerNotebook(panel, panel.context.model);
    });
  }

  public static trackNotebook(
    notebookTracker: INotebookTracker,
    sendRequest: AppCrtIframeApi["sendRequest"],
  ): TaskAutoSaver {
    return new TaskAutoSaver(notebookTracker, sendRequest);
  }

  private registerNotebook(panel: NotebookPanel, model: INotebookModel): void {
    panel.context.model.contentChanged.connect(() => {
      this.handleContentChange(panel, model);
    });

    const executionListener: ExecutionScheduledCallback = (sender, args) => {
      if (args.notebook === panel.content) {
        this.handleExecutionScheduled(panel, model);
      }
    };

    this.executionListeners.set(model, executionListener);

    NotebookActions.executionScheduled.connect(executionListener);

    panel.disposed.connect(() => {
      this.handleNotebookDisposed(model);
    });
  }

  private handleContentChange(
    panel: NotebookPanel,
    model: INotebookModel,
  ): void {
    this.cancelContentChangeTimer(model);

    const timer = setTimeout(() => {
      this.saveNotebook(panel, model);
      this.contentChangeTimers.delete(model);
    }, TaskAutoSaver.debounceInterval);

    this.contentChangeTimers.set(model, timer);
  }

  private async handleExecutionScheduled(
    panel: NotebookPanel,
    model: INotebookModel,
  ): Promise<void> {
    if (!model.dirty) {
      return;
    }

    this.cancelContentChangeTimer(model);
    await this.saveNotebook(panel, model);
  }

  private handleNotebookDisposed(model: INotebookModel): void {
    this.cancelContentChangeTimer(model);

    const listener = this.executionListeners.get(model);

    if (listener) {
      NotebookActions.executionScheduled.disconnect(listener);
      this.executionListeners.delete(model);
    }
  }

  private async saveNotebook(
    panel: NotebookPanel,
    model: INotebookModel,
  ): Promise<void> {
    if (!model.dirty) {
      return;
    }

    try {
      await panel.context.save();
      await this.postCurrentSolution(panel);
    } catch (error) {
      console.error(`Save failed:`, error);
    }
  }

  private async postCurrentSolution(panel: NotebookPanel): Promise<void> {
    try {
      const notebookData = panel.context.model.toJSON();

      const solution = new Blob([JSON.stringify(notebookData, null)], {
        type: "application/json",
      });

      await sendTaskSolution(solution, this.sendRequest);
    } catch (error) {
      console.warn("Failed to post solution to parent:", error);
    }
  }

  private cancelContentChangeTimer(model: INotebookModel): void {
    const timer = this.contentChangeTimers.get(model);

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.contentChangeTimers.delete(model);
  }
}

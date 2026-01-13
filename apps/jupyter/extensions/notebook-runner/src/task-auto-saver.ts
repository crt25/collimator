import {
  INotebookModel,
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";

export type ExecutionScheduledCallback = Parameters<
  typeof NotebookActions.executionScheduled.connect
>[0];

export class TaskAutoSaver {
  private readonly contentChangeTimers = new Map<string, NodeJS.Timeout>();
  private readonly executionListeners = new Map<
    string,
    ExecutionScheduledCallback
  >();
  public static debounceInterval = 2004;

  constructor(notebookTracker: INotebookTracker) {
    notebookTracker.widgetAdded.connect((sender, panel: NotebookPanel) => {
      this.registerNotebook(panel, panel.context.path, panel.context.model);
    });
  }

  public static trackNotebook(
    notebookTracker: INotebookTracker,
  ): TaskAutoSaver {
    return new TaskAutoSaver(notebookTracker);
  }

  private registerNotebook(
    panel: NotebookPanel,
    path: string,
    model: INotebookModel,
  ): void {
    panel.context.model.contentChanged.connect(() => {
      this.handleContentChange(panel, path, model);
    });

    const executionListener: ExecutionScheduledCallback = (sender, args) => {
      if (args.notebook === panel.content) {
        this.handleExecutionScheduled(panel, path, model);
      }
    };

    this.executionListeners.set(path, executionListener);

    NotebookActions.executionScheduled.connect(executionListener);

    panel.disposed.connect(() => {
      this.handleNotebookDisposed(panel, path);
    });
  }

  private handleContentChange(
    panel: NotebookPanel,
    path: string,
    model: INotebookModel,
  ): void {
    this.cancelContentChangeTimer(path);

    const timer = setTimeout(() => {
      this.saveNotebook(panel, path, model);
      this.contentChangeTimers.delete(path);
    }, TaskAutoSaver.debounceInterval);

    this.contentChangeTimers.set(path, timer);
  }

  private async handleExecutionScheduled(
    panel: NotebookPanel,
    path: string,
    model: INotebookModel,
  ): Promise<void> {
    if (!model.dirty) {
      return;
    }

    this.cancelContentChangeTimer(path);
    await this.saveNotebook(panel, path, model);
  }

  private handleNotebookDisposed(panel: NotebookPanel, path: string): void {
    this.cancelContentChangeTimer(path);

    const listener = this.executionListeners.get(path);

    if (listener) {
      NotebookActions.executionScheduled.disconnect(listener);
      this.executionListeners.delete(path);
    }
  }

  private async saveNotebook(
    panel: NotebookPanel,
    path: string,
    model: INotebookModel,
  ): Promise<void> {
    if (!model.dirty) {
      return;
    }

    try {
      await panel.context.save();
    } catch (error) {
      console.error(`Save failed:`, path, error);
    }
  }

  private cancelContentChangeTimer(path: string): void {
    const timer = this.contentChangeTimers.get(path);

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.contentChangeTimers.delete(path);
  }
}

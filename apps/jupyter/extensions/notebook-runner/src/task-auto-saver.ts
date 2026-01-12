import {
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";

type ExecutionScheduledCallback = Parameters<
  typeof NotebookActions.executionScheduled.connect
>[0];

export class TaskAutoSaver {
  private readonly contentChangeTimers = new Map<string, NodeJS.Timeout>();
  private readonly executionListeners = new Map<
    string,
    ExecutionScheduledCallback
  >();
  public debounceInterval = 2004;

  constructor(notebookTracker: INotebookTracker) {
    notebookTracker.widgetAdded.connect((sender, panel: NotebookPanel) => {
      this.registerNotebook(panel);
    });
  }

  private registerNotebook(panel: NotebookPanel): void {
    const path = panel.context.path;

    panel.context.model.contentChanged.connect(() => {
      this.handleContentChange(panel);
    });

    const executionListener: ExecutionScheduledCallback = (sender, args) => {
      if (args.notebook === panel.content) {
        this.handleExecutionScheduled(panel);
      }
    };

    this.executionListeners.set(path, executionListener);

    panel.disposed.connect(() => {
      this.handleNotebookDisposed(panel);
    });
  }

  private handleContentChange(panel: NotebookPanel): void {
    const path = panel.context.path;

    this.cancelContentChangeTimer(path);

    const timer = setTimeout(() => {
      this.saveNotebook(panel);
      this.contentChangeTimers.delete(path);
    }, this.debounceInterval);

    this.contentChangeTimers.set(path, timer);
  }

  private async handleExecutionScheduled(panel: NotebookPanel): Promise<void> {
    const model = panel.context.model;

    if (!model.dirty) {
      return;
    }

    this.cancelContentChangeTimer(panel.context.path);
    await this.saveNotebook(panel);
  }

  private handleNotebookDisposed(panel: NotebookPanel): void {
    const path = panel.context.path;

    this.cancelContentChangeTimer(path);

    const listener = this.executionListeners.get(path);

    if (listener) {
      NotebookActions.executionScheduled.disconnect(listener);
      this.executionListeners.delete(path);
    }
  }

  private async saveNotebook(panel: NotebookPanel): Promise<void> {
    const { path, model } = panel.context;

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

import {
  INotebookModel,
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";

import { AppCrtIframeApi } from "../iframe-rpc/src";
import { sendTaskSolution } from "./send-task-solution";

const logModule = "[Jupyter][auto-save/task-auto-saver]";

export type ExecutionScheduledCallback = Parameters<
  typeof NotebookActions.executionScheduled.connect
>[0];

export class TaskAutoSaver {
  private readonly contentChangeTimers = new Map<
    INotebookModel,
    NodeJS.Timeout
  >();
  // keyed by panel: two panels over the same document (e.g. the hidden
  // grading panel) share one model, and each needs its own listener
  private readonly executionListeners = new Map<
    NotebookPanel,
    ExecutionScheduledCallback
  >();
  private readonly inFlightSaves = new Map<INotebookModel, Promise<void>>();
  public static readonly debounceInterval = 30000;

  constructor(
    private readonly notebookTracker: INotebookTracker,
    private readonly sendRequest: AppCrtIframeApi["sendRequest"],
  ) {
    notebookTracker.widgetAdded.connect((_sender, panel: NotebookPanel) => {
      this.registerNotebook(panel, panel.context.model);
    });

    addEventListener("beforeunload", async () => {
      await this.handlePageUnload();
    });
  }

  public static trackNotebook(
    notebookTracker: INotebookTracker,
    sendRequest: AppCrtIframeApi["sendRequest"],
  ): TaskAutoSaver {
    return new TaskAutoSaver(notebookTracker, sendRequest);
  }

  public async saveAllNotebooks(): Promise<void> {
    const saves: Promise<void>[] = [];

    this.notebookTracker.forEach((panel) => {
      saves.push(this.saveNotebook(panel, panel.context.model));
    });

    await Promise.all(saves);
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

    this.executionListeners.set(panel, executionListener);

    NotebookActions.executionScheduled.connect(executionListener);

    panel.disposed.connect(() => {
      this.handleNotebookDisposed(panel);
    });
  }

  private handleContentChange(
    panel: NotebookPanel,
    model: INotebookModel,
  ): void {
    this.cancelContentChangeTimer(model);

    const timer = setTimeout(async () => {
      await this.saveNotebook(panel, model);
      this.contentChangeTimers.delete(model);
    }, TaskAutoSaver.debounceInterval);

    this.contentChangeTimers.set(model, timer);
  }

  private async handlePageUnload(): Promise<void> {
    // The timer cleanup is technically unnecessary since the page is
    // unloading, but we do it for good measure and to avoid any potential
    // side effects if the unload gets canceled for some reason.
    for (const model of [...this.contentChangeTimers.keys()]) {
      this.cancelContentChangeTimer(model);
    }

    // save through this instance: constructing a fresh TaskAutoSaver here
    // would register another beforeunload listener each time, doubling every
    // later save (CRT-467)
    await this.saveAllNotebooks();
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

  private handleNotebookDisposed(panel: NotebookPanel): void {
    this.cancelContentChangeTimer(panel.context.model);

    const listener = this.executionListeners.get(panel);

    if (listener) {
      NotebookActions.executionScheduled.disconnect(listener);
      this.executionListeners.delete(panel);
    }
  }

  private saveNotebook(
    panel: NotebookPanel,
    model: INotebookModel,
  ): Promise<void> {
    // A run-all schedules every code cell in the same synchronous tick, one
    // executionScheduled emission per cell, and the dirty flag only clears
    // once the save resolves - so each emission would trigger its own save
    // and solution post. Coalesce them onto the save already in flight
    // (CRT-467).
    const inFlight = this.inFlightSaves.get(model);
    if (inFlight) {
      return inFlight;
    }

    if (!model.dirty) {
      return Promise.resolve();
    }

    const save = this.performSave(panel).finally(() => {
      this.inFlightSaves.delete(model);
    });
    this.inFlightSaves.set(model, save);

    return save;
  }

  private async performSave(panel: NotebookPanel): Promise<void> {
    try {
      await panel.context.save();
      await this.postCurrentSolution(panel);
    } catch (error) {
      console.error(`${logModule} Save failed:`, error);
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
      console.warn(`${logModule} Failed to post solution to parent:`, error);
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

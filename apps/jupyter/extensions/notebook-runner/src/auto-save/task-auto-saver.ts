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
  // keyed by panel for the same reason: the contentChanged signal lives on the
  // shared model, so each panel's slot must be disconnected individually
  private readonly contentChangeListeners = new Map<
    NotebookPanel,
    () => void
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
    const contentChangeListener = (): void => {
      this.handleContentChange(model);
    };

    model.contentChanged.connect(contentChangeListener);
    this.contentChangeListeners.set(panel, contentChangeListener);

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

  private handleContentChange(model: INotebookModel): void {
    this.cancelContentChangeTimer(model);

    const timer = setTimeout(async () => {
      // a model can be shared by more than one panels
      // resolve the panel when the timer fires so we never save through the panel that originally scheduled the timer after it closed
      const livePanel = [...this.contentChangeListeners.keys()].find(
        (panel) => panel.context.model === model,
      );

      if (livePanel) {
        await this.saveNotebook(livePanel, model);
      }

      // a content change can replace this timer while the save is awaiting, so only remove the map entry if it still belongs to this callback
      if (this.contentChangeTimers.get(model) === timer) {
        this.contentChangeTimers.delete(model);
      }
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
    const model = panel.context.model;

    const executionListener = this.executionListeners.get(panel);

    if (executionListener) {
      NotebookActions.executionScheduled.disconnect(executionListener);
      this.executionListeners.delete(panel);
    }

    const contentChangeListener = this.contentChangeListeners.get(panel);

    if (contentChangeListener) {
      model.contentChanged.disconnect(contentChangeListener);
      this.contentChangeListeners.delete(panel);
    }

    // the debounce timer belongs to the shared model, not to one panel
    // keep it while another panel can still save that model, and cancel it
    // only when the model's final panel has been disposed
    const modelStillHasPanel = [...this.contentChangeListeners.keys()].some(
      (livePanel) => livePanel.context.model === model,
    );

    if (!modelStillHasPanel) {
      this.cancelContentChangeTimer(model);
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
    //
    // We deliberately do not re-check dirtiness and re-save when the in-flight
    // save settles: changes that land mid-save (e.g. the run-all's cell
    // outputs) fire contentChanged, which re-arms the debounce timer in
    // handleContentChange independently of this map, so they are still saved -
    // just debounced rather than immediately. Re-saving on settle would
    // reintroduce an extra immediate post per run-all.
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

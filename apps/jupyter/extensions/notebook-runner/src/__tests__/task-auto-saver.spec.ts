import {
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";
import { Cell, ICellModel } from "@jupyterlab/cells";
import { TaskAutoSaver } from "../auto-save/task-auto-saver";
import { sendTaskSolution } from "../auto-save/send-task-solution";
import { getCallbacksFromMockConnection } from "./helpers/callback";

describe("TaskAutoSaver", () => {
  let mockTracker: INotebookTracker;
  let mockPanel: NotebookPanel;
  let mockSave: jest.SpyInstance;
  let mockContentChangedConnect: jest.SpyInstance;
  let mockSendTaskSolution: jest.SpyInstance;
  let mockDisposedConnect: jest.SpyInstance;
  let mockToJSON: jest.SpyInstance;
  const mockCell = {} as Cell<ICellModel>;

  const createMockPanel = (path: string, dirty: boolean): NotebookPanel => {
    const save = jest.fn().mockResolvedValue(undefined);
    const contentChangedConnect = jest.fn();
    const disposedConnect = jest.fn();
    const toJSON = jest.fn().mockReturnValue({ cells: [] });

    return {
      context: {
        path,
        model: {
          dirty,
          toJSON,
          contentChanged: {
            connect: contentChangedConnect,
            disconnect: jest.fn(),
          },
        } as Partial<
          NotebookPanel["context"]["model"]
        > as NotebookPanel["context"]["model"],
        save,
      } as Partial<NotebookPanel["context"]> as NotebookPanel["context"],

      content: { id: path, activeCell: mockCell } as NotebookPanel["content"],

      disposed: {
        connect: disposedConnect,
        disconnect: jest.fn(),
      },
    } as Partial<NotebookPanel> as NotebookPanel;
  };

  const simulateExecutionScheduled = (panel: NotebookPanel): void => {
    const callbacks = getCallbacksFromMockConnection(
      NotebookActions.executionScheduled.connect,
    );

    const cell = panel.content.activeCell;

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](NotebookActions, {
        notebook: panel.content,
        cell: cell!,
      });
    }
  };

  const simulateContentChange = (panel: NotebookPanel): void => {
    panel.context.model.dirty = true;
    const callbacks = getCallbacksFromMockConnection(
      panel.context.model.contentChanged.connect,
    );

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](panel.context.model, undefined);
    }
  };

  const simulateDisposal = (panel: NotebookPanel): void => {
    const callbacks = getCallbacksFromMockConnection(panel.disposed.connect);

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](panel, undefined);
    }
  };

  const addNotebookToTracker = (panel: NotebookPanel): void => {
    const callbacks = getCallbacksFromMockConnection(
      mockTracker.widgetAdded.connect,
    );

    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i](mockTracker, panel);
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();

    jest
      .spyOn(NotebookActions.executionScheduled, "connect")
      .mockImplementation(jest.fn());
    jest
      .spyOn(NotebookActions.executionScheduled, "disconnect")
      .mockImplementation(jest.fn());

    mockPanel = createMockPanel("/test/notebook.ipynb", false);

    mockSave = jest.spyOn(mockPanel.context, "save");
    mockContentChangedConnect = jest.spyOn(
      mockPanel.context.model.contentChanged,
      "connect",
    );
    mockDisposedConnect = jest.spyOn(mockPanel.disposed, "connect");
    mockToJSON = jest.spyOn(mockPanel.context.model, "toJSON");

    mockSendTaskSolution = jest
      .spyOn({ sendTaskSolution }, "sendTaskSolution")
      .mockResolvedValue(undefined);

    mockTracker = {
      widgetAdded: {
        connect: jest.fn(),
        disconnect: jest.fn(),
      },
    } as Partial<INotebookTracker> as INotebookTracker;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it.only("should connect to notebook events when added to tracker", () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    expect(mockContentChangedConnect).toHaveBeenCalled();
    expect(mockDisposedConnect).toHaveBeenCalled();
  });

  it("should unregister notebook on disposal", () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateDisposal(mockPanel);

    expect(
      jest.mocked(NotebookActions.executionScheduled.disconnect),
    ).toHaveBeenCalled();
  });

  it("should debounce saves on rapid content changes", () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should reset debounce timer on each content change", () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval / 2);
    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval / 2);

    // Save should not have been called here because the timer was reset
    expect(mockSave).not.toHaveBeenCalled();

    // Wait the remaining half interval plus a little extra to ensure the timer completes
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval / 2 + 5);

    // Now that the full debounce interval has passed since the last change, save should be called
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should cleanup timers on notebook disposal", () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateDisposal(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("should handle multiple notebooks independently", () => {
    const mockPanel2 = createMockPanel("/test/notebook2.ipynb", false);
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);
    addNotebookToTracker(mockPanel2);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel2);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockPanel.context.save).toHaveBeenCalledTimes(1);
    expect(mockPanel2.context.save).toHaveBeenCalledTimes(1);
  });

  it("should not save on execution when notebook is not dirty", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    mockPanel.context.model.dirty = false;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("should save immediately when execution is scheduled and notebook is dirty", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    mockPanel.context.model.dirty = true;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should cancel debounce timer when execution triggers immediate save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval / 2);
    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    // Save should have been called once due to execution
    expect(mockSave).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should post solution to parent after successful save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });

  it("should post solution after execution-triggered save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    mockPanel.context.model.dirty = true;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });

  it("should convert notebook to JSON before posting", async () => {
    TaskAutoSaver.trackNotebook(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    await Promise.resolve();

    expect(mockToJSON).toHaveBeenCalledTimes(1);
  });
});

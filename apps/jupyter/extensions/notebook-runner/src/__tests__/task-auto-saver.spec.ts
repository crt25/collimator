import {
  INotebookTracker,
  NotebookActions,
  NotebookPanel,
} from "@jupyterlab/notebook";
import { Cell, ICellModel } from "@jupyterlab/cells";
import { TaskAutoSaver } from "../auto-save/task-auto-saver";
import * as sendTaskSolutionModule from "../auto-save/send-task-solution";
import { AppCrtIframeApi } from "../iframe-rpc/src";
import { getCallbacksFromMockConnection } from "./helpers/callback";

describe("TaskAutoSaver", () => {
  let mockTracker: INotebookTracker;
  let mockPanel: NotebookPanel;
  let mockSave: jest.Mock = jest.fn();
  let mockContentChangedConnect: jest.Mock = jest.fn();
  let mockDisposedConnect: jest.Mock = jest.fn();
  let mockToJSON: jest.Mock = jest.fn();
  let mockSendTaskSolution: jest.SpyInstance;
  let mockSendRequest: AppCrtIframeApi["sendRequest"];
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

    for (const callback of callbacks) {
      callback(NotebookActions, {
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

    for (const callback of callbacks) {
      callback(panel.context.model, undefined);
    }
  };

  const simulateDisposal = (panel: NotebookPanel): void => {
    const callbacks = getCallbacksFromMockConnection(panel.disposed.connect);

    for (const callback of callbacks) {
      callback(panel, undefined);
    }
  };

  const addNotebookToTracker = (panel: NotebookPanel): void => {
    const callbacks = getCallbacksFromMockConnection(
      mockTracker.widgetAdded.connect,
    );

    for (const callback of callbacks) {
      callback(mockTracker, panel);
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

    mockSave = mockPanel.context.save as jest.Mock;
    mockContentChangedConnect = mockPanel.context.model.contentChanged
      .connect as jest.Mock;
    mockDisposedConnect = mockPanel.disposed.connect as jest.Mock;
    mockToJSON = mockPanel.context.model.toJSON as jest.Mock;

    mockSendTaskSolution = jest
      .spyOn(sendTaskSolutionModule, "sendTaskSolution")
      .mockResolvedValue(undefined);

    mockSendRequest = jest.fn() as AppCrtIframeApi["sendRequest"];

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

  it("should connect to notebook events when added to tracker", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    expect(mockContentChangedConnect).toHaveBeenCalled();
    expect(mockDisposedConnect).toHaveBeenCalled();
  });

  it("should unregister notebook on disposal", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    simulateDisposal(mockPanel);

    expect(
      jest.mocked(NotebookActions.executionScheduled.disconnect),
    ).toHaveBeenCalled();
  });

  it("should debounce saves on rapid content changes", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should reset debounce timer on each content change", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
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
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateDisposal(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("should handle multiple notebooks independently", () => {
    const mockPanel2 = createMockPanel("/test/notebook2.ipynb", false);
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);
    addNotebookToTracker(mockPanel2);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel2);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    expect(mockPanel.context.save).toHaveBeenCalledTimes(1);
    expect(mockPanel2.context.save).toHaveBeenCalledTimes(1);
  });

  it("should not save on execution when notebook is not dirty", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = false;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("should save immediately when execution is scheduled and notebook is dirty", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = true;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should cancel debounce timer when execution triggers immediate save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
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
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });

  it("should post solution after execution-triggered save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = true;
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);

    await Promise.resolve();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });

  it("should convert notebook to JSON before posting", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(TaskAutoSaver.debounceInterval);

    await Promise.resolve();

    expect(mockToJSON).toHaveBeenCalledTimes(1);
  });

  const flushMicrotasks = async (): Promise<void> => {
    for (let i = 0; i < 10; i++) {
      await Promise.resolve();
    }
  };

  // the dirty flag only clears once the save resolves - like the real
  // panel.context.save(), it stays set for the whole synchronous tick
  const makeSaveClearDirty = (panel: NotebookPanel): void => {
    (panel.context.save as jest.Mock).mockImplementation(() =>
      Promise.resolve().then(() => {
        panel.context.model.dirty = false;
      }),
    );
  };

  it("coalesces a run-all burst into a single save and post", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = true;
    makeSaveClearDirty(mockPanel);
    addNotebookToTracker(mockPanel);

    // NotebookActions.runAll schedules every code cell in the same
    // synchronous tick - one executionScheduled emission per cell (CRT-467)
    for (let cell = 0; cell < 8; cell++) {
      simulateExecutionScheduled(mockPanel);
    }

    await flushMicrotasks();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });

  it("saves again for changes made after a coalesced save", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = true;
    makeSaveClearDirty(mockPanel);
    addNotebookToTracker(mockPanel);

    simulateExecutionScheduled(mockPanel);
    simulateExecutionScheduled(mockPanel);
    await flushMicrotasks();

    mockPanel.context.model.dirty = true;
    simulateExecutionScheduled(mockPanel);
    await flushMicrotasks();

    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(2);
  });

  it("saves through the existing saver on page unload", async () => {
    (
      mockTracker as unknown as {
        forEach: (callback: (panel: NotebookPanel) => void) => void;
      }
    ).forEach = (callback): void => callback(mockPanel);

    // Capture the beforeunload handler this saver registers rather than
    // dispatching a global event: earlier trackNotebook calls in this file
    // leave their own beforeunload listeners on the shared jsdom window, and
    // dispatching would fire those too - their stale mock trackers have no
    // forEach, throwing unhandled rejections behind these assertions.
    const addEventListenerSpy = jest
      .spyOn(window, "addEventListener")
      .mockImplementation(() => undefined);

    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    mockPanel.context.model.dirty = true;
    makeSaveClearDirty(mockPanel);
    addNotebookToTracker(mockPanel);

    const widgetAddedConnectCount = (
      mockTracker.widgetAdded.connect as jest.Mock
    ).mock.calls.length;

    const beforeUnloadHandler = addEventListenerSpy.mock.calls
      .filter(([type]) => type === "beforeunload")
      .map(([, handler]) => handler)
      .pop() as EventListener;

    beforeUnloadHandler(new Event("beforeunload"));
    await flushMicrotasks();

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
    // the unload handler must not construct new savers: each would register
    // another beforeunload listener, doubling every later save (1→2→4→8)
    expect(
      (mockTracker.widgetAdded.connect as jest.Mock).mock.calls.length,
    ).toBe(widgetAddedConnectCount);
  });

  it("disconnects the disposed panel's own execution listener", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    // a second panel over the same document shares the model, like the
    // hidden grading panel over the student notebook
    const hiddenPanel = {
      context: mockPanel.context,
      content: {
        id: "/test/notebook.ipynb-hidden",
        activeCell: mockCell,
      } as NotebookPanel["content"],
      disposed: {
        connect: jest.fn(),
        disconnect: jest.fn(),
      },
    } as Partial<NotebookPanel> as NotebookPanel;
    addNotebookToTracker(hiddenPanel);

    const connectedListeners = jest.mocked(
      NotebookActions.executionScheduled.connect,
    ).mock.calls;
    const visiblePanelListener = connectedListeners[0][0];

    simulateDisposal(mockPanel);

    expect(
      jest.mocked(NotebookActions.executionScheduled.disconnect),
    ).toHaveBeenCalledWith(visiblePanelListener);
  });

  it("disconnects the disposed panel's own content-changed listener", () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    const contentChangedDisconnect = mockPanel.context.model.contentChanged
      .disconnect as jest.Mock;
    const connectedListener = (
      mockPanel.context.model.contentChanged.connect as jest.Mock
    ).mock.calls[0][0];

    simulateDisposal(mockPanel);

    expect(contentChangedDisconnect).toHaveBeenCalledWith(connectedListener);
  });

  it("keeps a shared model's pending save when one panel is disposed", async () => {
    TaskAutoSaver.trackNotebook(mockTracker, mockSendRequest);
    addNotebookToTracker(mockPanel);

    const hiddenPanel = {
      context: mockPanel.context,
      content: {
        id: "/test/notebook.ipynb-hidden",
        activeCell: mockCell,
      } as NotebookPanel["content"],
      disposed: {
        connect: jest.fn(),
        disconnect: jest.fn(),
      },
    } as Partial<NotebookPanel> as NotebookPanel;
    addNotebookToTracker(hiddenPanel);

    simulateContentChange(mockPanel);
    simulateDisposal(hiddenPanel);
    await jest.advanceTimersByTimeAsync(TaskAutoSaver.debounceInterval);

    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(mockSendTaskSolution).toHaveBeenCalledTimes(1);
  });
});

import { INotebookTracker, NotebookPanel } from "@jupyterlab/notebook";
import { TaskAutoSaver } from "../task-auto-saver";

describe("TaskAutoSaver", () => {
  let mockTracker: INotebookTracker;
  let mockPanel: NotebookPanel;
  let mockSave: jest.Mock;
  let mockContentChangedConnect: jest.Mock;
  let mockDisposedConnect: jest.Mock;

  const createMockPanel = (path: string, dirty: boolean): NotebookPanel => {
    const save = jest.fn().mockResolvedValue(undefined);
    const contentChangedConnect = jest.fn();
    const disposedConnect = jest.fn();

    return {
      context: {
        path,
        model: {
          dirty,
          contentChanged: {
            connect: contentChangedConnect,
            disconnect: jest.fn(),
          },
        } as Partial<
          NotebookPanel["context"]["model"]
        > as NotebookPanel["context"]["model"],
        save,
      } as Partial<NotebookPanel["context"]> as NotebookPanel["context"],

      content: { id: path } as NotebookPanel["content"],

      disposed: {
        connect: disposedConnect,
        disconnect: jest.fn(),
      },
    } as Partial<NotebookPanel> as NotebookPanel;
  };

  const simulateContentChange = (panel: NotebookPanel): void => {
    panel.context.model.dirty = true;
    const callback = jest.mocked(panel.context.model.contentChanged.connect)
      .mock.calls[0][0];

    callback(panel.context.model, undefined);
  };

  const simulateDisposal = (panel: NotebookPanel): void => {
    const callback = jest.mocked(panel.disposed.connect).mock.calls[0][0];

    callback(panel, undefined);
  };

  const addNotebookToTracker = (panel: NotebookPanel): void => {
    const callback = jest.mocked(mockTracker.widgetAdded.connect).mock
      .calls[0][0];

    callback(mockTracker, panel);
  };

  beforeEach(() => {
    jest.useFakeTimers();

    mockPanel = createMockPanel("/test/notebook.ipynb", false);
    mockSave = jest.mocked(mockPanel.context.save);
    mockContentChangedConnect = jest.mocked(
      mockPanel.context.model.contentChanged.connect,
    );
    mockDisposedConnect = jest.mocked(mockPanel.disposed.connect);

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

  it("should register notebook when added to tracker", () => {
    new TaskAutoSaver(mockTracker);
    addNotebookToTracker(mockPanel);

    expect(mockContentChangedConnect).toHaveBeenCalled();
    expect(mockDisposedConnect).toHaveBeenCalled();
  });

  it("should debounce saves on rapid content changes", () => {
    const autoSaver = new TaskAutoSaver(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(autoSaver.debounceInterval);

    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should reset debounce timer on each content change", () => {
    const autoSaver = new TaskAutoSaver(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(autoSaver.debounceInterval / 2);
    simulateContentChange(mockPanel);
    jest.advanceTimersByTime(autoSaver.debounceInterval / 2);

    // Save should not have been called here because the timer was reset
    expect(mockSave).not.toHaveBeenCalled();

    // Wait the remaining half interval plus a little extra to ensure the timer completes
    jest.advanceTimersByTime(autoSaver.debounceInterval / 2 + 5);

    // Now that the full debounce interval has passed since the last change, save should be called
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it("should cleanup timers on notebook disposal", () => {
    const autoSaver = new TaskAutoSaver(mockTracker);
    addNotebookToTracker(mockPanel);

    simulateContentChange(mockPanel);
    simulateDisposal(mockPanel);
    jest.advanceTimersByTime(autoSaver.debounceInterval);

    expect(mockSave).not.toHaveBeenCalled();
  });

  it("should handle multiple notebooks independently", () => {
    const mockPanel2 = createMockPanel("/test/notebook2.ipynb", false);
    const autoSaver = new TaskAutoSaver(mockTracker);
    addNotebookToTracker(mockPanel);
    addNotebookToTracker(mockPanel2);

    simulateContentChange(mockPanel);
    simulateContentChange(mockPanel2);
    jest.advanceTimersByTime(autoSaver.debounceInterval);

    expect(mockPanel.context.save).toHaveBeenCalledTimes(1);
    expect(mockPanel2.context.save).toHaveBeenCalledTimes(1);
  });
});

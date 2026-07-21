import { JupyterFrontEnd } from "@jupyterlab/application";
import { IRunningSessionSidebar } from "@jupyterlab/running";
import { IPropertyInspectorProvider } from "@jupyterlab/property-inspector";
import { FileBrowser } from "@jupyterlab/filebrowser";
import { Contents } from "@jupyterlab/services";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { DocumentRegistry, IDocumentWidget } from "@jupyterlab/docregistry";
import { Kernel } from "@jupyterlab/services";
import { KnownWidget } from "./known-widget";
import { Mode } from "./mode";
import { WidgetArea } from "./widget-area";

export const protectedFiles = ["task.ipynb"];
export const hiddenFolders = [
  "autograder",
  "student",
  "grading_src",
  "grading_data",
];
export type CustomRename = (
  oldPath: string,
  newPath: string,
  allowHiddenFolders?: boolean,
) => Promise<Contents.IModel>;
export type CustomUpload = (
  file: File,
  path?: string,
) => Promise<Contents.IModel>;

const allowedWidgets: Record<Mode, KnownWidget[]> = {
  [Mode.edit]: [
    KnownWidget.tableOfContents,
    KnownWidget.titlePanel,
    KnownWidget.statusBar,
    KnownWidget.commandPalette,
    KnownWidget.filebrowser,
    KnownWidget.propertyInspector,
    KnownWidget.runningSessions,
  ],
  [Mode.show]: [],
  [Mode.solve]: [
    KnownWidget.tableOfContents,
    KnownWidget.titlePanel,
    KnownWidget.statusBar,
    KnownWidget.commandPalette,
    KnownWidget.filebrowser,
    KnownWidget.runningSessions,
  ],
};

const hideDisallowedWidgets = (mode: Mode, app: JupyterFrontEnd): void => {
  for (const area of Object.values(WidgetArea)) {
    for (const widget of app.shell.widgets(area)) {
      if (!allowedWidgets[mode].includes(widget.id as KnownWidget)) {
        widget.dispose();
      }
    }
  }
};

export const simplifyUserInterface = async (
  mode: Mode,
  app: JupyterFrontEnd,
  runningSessions: IRunningSessionSidebar,
  propertyInspectorProvider: IPropertyInspectorProvider,
  fileBrowser: FileBrowser,
  documentManager?: IDocumentManager,
): Promise<void> => {
  if (mode !== Mode.edit) {
    // @ts-expect-error The exposed type is not complete
    propertyInspectorProvider.dispose();
    // @ts-expect-error The exposed type is not complete
    runningSessions.dispose();

    throwOnRestrictedFileOperation(fileBrowser);

    if (mode === Mode.solve && documentManager) {
      redirectTaskFileOpensToStudentVersion(documentManager);
    }
  }

  hideGradingFolders(fileBrowser);

  // activate simple mode
  await app.commands.execute("application:toggle-mode");
  // hide the status bar
  await app.commands.execute("statusbar:toggle");

  hideDisallowedWidgets(mode, app);
};

const throwOnRestrictedFileOperation = (fileBrowser: FileBrowser): void => {
  const contents = fileBrowser.model.manager;

  const originalRename = contents.rename.bind(contents);
  contents.rename = (async (
    oldPath: string,
    newPath: string,
    // this allows internal calls to rename to bypass the check
    allowHiddenFolders = false,
  ): Promise<Contents.IModel> => {
    const oldName = oldPath.split("/").pop() || "";
    const newName = newPath.split("/").pop() || "";

    if (!allowHiddenFolders && hiddenFolders.includes(newName)) {
      throw new HiddenFolderError(newName);
    }

    if (protectedFiles.includes(oldName)) {
      if (oldName === newName) {
        // moving a protected file to another directory (name unchanged)
        throw new ProtectedFileMoveError(oldName);
      }

      // renaming a protected file away from its required name
      throw new ProtectedFileRenameError(oldName);
    }

    if (protectedFiles.includes(newName)) {
      // renaming or moving another file to a reserved name
      throw new ProtectedFileError(newName);
    }

    return originalRename(oldPath, newPath);
  }) satisfies CustomRename;

  const originalUpload = fileBrowser.model.upload.bind(fileBrowser.model);

  fileBrowser.model.upload = (async (
    file: File,
    path?: string,
  ): Promise<Contents.IModel> => {
    if (protectedFiles.includes(file.name)) {
      throw new ProtectedFileError(file.name);
    }

    return originalUpload(file, path);
  }) satisfies CustomUpload;
};

/**
 * A function to hide grading folders in the file browser.
 * A bit hacky because there is no public API to filter items.
 * @param fileBrowser The file browser instance
 */
const hideGradingFolders = (fileBrowser: FileBrowser): void => {
  let items: Contents.IModel[] = fileBrowser.model["_items"];

  /**
   * Override the items getter to filter the desired folder.
   */
  Object.defineProperty(fileBrowser.model, "_items", {
    get() {
      return items.filter(
        (item) =>
          !(item.type === "directory" && hiddenFolders.includes(item.name)),
      );
    },
    set(v) {
      items = v;
    },
  });

  fileBrowser.model.refresh();
};

const studentTaskPath = "/student/task.ipynb";

const isTaskFile = (path: string): boolean =>
  path === "/task.ipynb" || path === "task.ipynb";

/**
 * The student never edits the teacher template directly: opening `task.ipynb`
 * transparently opens their own `/student/task.ipynb`. That copy is (re)written
 * asynchronously after a reload (e.g. a language change wipes the memory-backed
 * contents and the frontend re-sends the submission), so opening it too early
 * throws "could not find content" (CRT-397). We therefore only open it once it
 * exists, and otherwise do nothing — the task auto-opens as soon as the content
 * is restored, and we must never fall back to opening the template itself.
 */
const redirectTaskFileOpensToStudentVersion = (
  documentManager: IDocumentManager,
): void => {
  const openStudentTaskWhenReady = (
    open: (
      path: string,
      widgetName?: string,
      kernel?: Partial<Kernel.IModel>,
      options?: DocumentRegistry.IOpenOptions,
    ) => IDocumentWidget | undefined,
    widgetName?: string,
    kernel?: Partial<Kernel.IModel>,
    options?: DocumentRegistry.IOpenOptions,
  ): void => {
    void documentManager.services.contents
      .get(studentTaskPath, { content: false })
      .then(() => open(studentTaskPath, widgetName, kernel, options))
      .catch(() => {
        // the student copy has not been restored yet; ignore this open.
      });
  };

  const originalOpenOrReveal =
    documentManager.openOrReveal.bind(documentManager);
  documentManager.openOrReveal = (
    path: string,
    widgetName?: string,
    kernel?: Partial<Kernel.IModel>,
    options?: DocumentRegistry.IOpenOptions,
  ): ReturnType<IDocumentManager["openOrReveal"]> => {
    if (!isTaskFile(path)) {
      return originalOpenOrReveal(path, widgetName, kernel, options);
    }

    openStudentTaskWhenReady(originalOpenOrReveal, widgetName, kernel, options);
    return undefined;
  };

  const originalOpen = documentManager.open.bind(documentManager);
  documentManager.open = (
    path,
    widgetName,
    kernel,
    options,
  ): IDocumentWidget | undefined => {
    if (!isTaskFile(path)) {
      return originalOpen(path, widgetName, kernel, options);
    }

    openStudentTaskWhenReady(originalOpen, widgetName, kernel, options);
    return undefined;
  };
};

class HiddenFolderError extends Error {
  // Ensure that the error object is compatible with the format expected by JupyterLite.
  // See https://github.com/jupyterlab/jupyterlab/blob/35e1551dbd31104d76834848ce3c620a82921839/packages/docmanager/src/dialogs.ts#L210.
  public readonly response = {
    status: 400,
    statusText: "Bad Request",
  };

  constructor(folderName: string) {
    super(`The folder name ${folderName} is not allowed.`);
  }
}

class ProtectedFileError extends Error {
  // Ensure that the error object is compatible with the format expected by JupyterLite.
  // See https://github.com/jupyterlab/jupyterlab/blob/35e1551dbd31104d76834848ce3c620a82921839/packages/docmanager/src/dialogs.ts#L210.
  public readonly response = {
    status: 400,
    statusText: "Bad Request",
  };

  constructor(fileName: string) {
    super(`The file name ${fileName} is not allowed.`);
  }
}

class ProtectedFileRenameError extends Error {
  // Ensure that the error object is compatible with the format expected by JupyterLite.
  // See https://github.com/jupyterlab/jupyterlab/blob/35e1551dbd31104d76834848ce3c620a82921839/packages/docmanager/src/dialogs.ts#L210.
  public readonly response = {
    status: 400,
    statusText: "Bad Request",
  };

  constructor(fileName: string) {
    super(`Only the file name ${fileName} is allowed.`);
  }
}

class ProtectedFileMoveError extends Error {
  // Ensure that the error object is compatible with the format expected by JupyterLite.
  // See https://github.com/jupyterlab/jupyterlab/blob/35e1551dbd31104d76834848ce3c620a82921839/packages/docmanager/src/dialogs.ts#L210.
  public readonly response = {
    status: 400,
    statusText: "Bad Request",
  };

  constructor(fileName: string) {
    super(`The file ${fileName} can't be moved.`);
  }
}

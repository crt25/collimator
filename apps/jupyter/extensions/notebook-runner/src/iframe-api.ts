import { JupyterFrontEnd } from "@jupyterlab/application";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { FileBrowser } from "@jupyterlab/filebrowser";

import { DEFAULT_SCROLL_HEIGHT } from "./constants";
import {
  AppCrtIframeApi,
  AppHandleRequestMap,
  GetTask,
  Language,
  LoadSubmission,
  LoadTask,
  SetLocale,
  Submission,
  Task,
} from "./iframe-rpc/src";

import { stopBufferingIframeMessages } from "./iframe-message-buffer";
import { OtterGradingResults } from "./grading-results";
import { runAssignCommand, runGradingCommand } from "./command";
import { Mode } from "./mode";
import {
  CrtInternalTask,
  GenericNotebookTask,
  Directory,
  importCrtInternalTask,
  importGenericNotebookTask,
  exportCrtInternalTask,
  exportExternalCustomTask,
  SharedDirectories,
} from "./task-converter";

import { detectTaskFormat } from "./format-detector";
import { ImportTask } from "./iframe-rpc/src/methods/import-task";
import { TaskFormat } from "./task-format";

import {
  DirectoryNotFoundError,
  GenericNotebookTaskImportError,
  GetTaskError,
  UnsupportedTaskFormatError,
} from "./errors/task-errors";
import { hasStatus } from "./utils";
import {
  ExportTask,
  ExportTaskResult,
} from "./iframe-rpc/src/methods/export-task";

const logModule = "[Embedded Jupyter]";

const initIframeApi = (handleRequest: AppHandleRequestMap): AppCrtIframeApi => {
  const crtPlatform = new AppCrtIframeApi({
    ...handleRequest,
    loadSubmission: async (
      ...args: Parameters<typeof handleRequest.loadSubmission>
    ): ReturnType<typeof handleRequest.loadSubmission> => {
      crtPlatform.setOrigin(args[1].origin);

      return handleRequest.loadSubmission(...args);
    },
    loadTask: async (
      ...args: Parameters<typeof handleRequest.loadTask>
    ): ReturnType<typeof handleRequest.loadTask> => {
      crtPlatform.setOrigin(args[1].origin);

      return handleRequest.loadTask(...args);
    },
  });

  if (window.parent && window.parent !== window) {
    crtPlatform.setTarget(window.parent);
  }

  window.addEventListener(
    "message",
    crtPlatform.handleWindowMessage.bind(crtPlatform),
  );

  const bufferedMessages = stopBufferingIframeMessages();
  for (const msg of bufferedMessages) {
    crtPlatform.handleWindowMessage(msg);
  }

  return crtPlatform;
};

export class EmbeddedPythonCallbacks {
  public static readonly taskName: string = "task.ipynb";
  public static readonly studentTaskLocation: string = `/student/${EmbeddedPythonCallbacks.taskName}`;
  public static readonly taskTemplateLocation: string = `/${EmbeddedPythonCallbacks.taskName}`;

  public static readonly autograderName: string = "autograder.zip";
  public static readonly autograderLocation: string = `/autograder/${EmbeddedPythonCallbacks.autograderName}`;

  public static readonly dataLocation: string = "/data";
  public static readonly gradingDataLocation: string = "/grading_data";
  public static readonly srcLocation: string = "/src";
  public static readonly gradingSrcLocation: string = "/grading_src";

  constructor(
    private readonly mode: Mode,
    private readonly app: JupyterFrontEnd,
    private readonly documentManager: IDocumentManager,
    private readonly fileBrowser: FileBrowser,
  ) {}

  async getHeight(): Promise<number> {
    return document.body.scrollHeight || DEFAULT_SCROLL_HEIGHT;
  }

  async getTask(request: GetTask["request"]): Promise<Task> {
    try {
      // generate student task and autograder
      await this.app.commands.execute(runAssignCommand);

      const initialSolution = await this.getJupyterSubmission();
      const studentTaskFile = initialSolution.file;

      const taskTemplateFile = await this.getFileContents(
        EmbeddedPythonCallbacks.taskTemplateLocation,
      );

      const autograderFile = await this.getFileContents(
        EmbeddedPythonCallbacks.autograderLocation,
      );

      const folders = await this.getAllFolderContents();

      const crtInternalTask = {
        taskTemplateFile,
        studentTaskFile,
        autograderFile,
        ...folders,
      } satisfies CrtInternalTask;

      const taskBlob = await exportCrtInternalTask(crtInternalTask);

      return {
        file: taskBlob,
        initialSolution,
      };
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      const errorMessage = e instanceof Error ? e.message : String(e);

      throw new GetTaskError(errorMessage);
    }
  }

  async exportTask(request: ExportTask["request"]): Promise<ExportTaskResult> {
    try {
      console.debug(`${logModule} Exporting task in external format`);

      const taskFile = await this.getFileContents(
        EmbeddedPythonCallbacks.taskTemplateLocation,
      );

      const folders = await this.getAllFolderContents();

      const externalTask = {
        taskFile,
        ...folders,
      } satisfies GenericNotebookTask;

      const taskBlob = await exportExternalCustomTask(externalTask);

      return {
        file: taskBlob,
        filename: "task.zip",
      };
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      throw e;
    }
  }

  async loadTask(request: LoadTask["request"]): Promise<undefined> {
    try {
      this.setJupyterLocale(request.params.language);

      console.debug(`${logModule} Loading project`);
      const importedFiles = await importCrtInternalTask(request.params.task);

      await this.closeAllDocuments();

      await this.writeCrtInternalTask(importedFiles);
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      throw e;
    }

    return undefined;
  }

  async importTask(request: ImportTask["request"]): Promise<undefined> {
    try {
      this.setJupyterLocale(request.params.language);

      const fileFormat = await detectTaskFormat(request.params.task);

      await this.closeAllDocuments();

      switch (fileFormat) {
        case TaskFormat.CrtInternal: {
          const importedCrtInternalFiles = await importCrtInternalTask(
            request.params.task,
          );

          await this.writeCrtInternalTask(importedCrtInternalFiles);

          break;
        }

        case TaskFormat.GenericNotebook: {
          const importedExternalFiles = await importGenericNotebookTask(
            request.params.task,
          );

          if (this.mode !== Mode.edit && this.mode !== Mode.solve) {
            // cannot import external custom task in show mode
            throw new GenericNotebookTaskImportError();
          }

          await this.writeGenericNotebookTask(importedExternalFiles);

          break;
        }

        default:
          throw new UnsupportedTaskFormatError(Object.values(TaskFormat));
      }
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      throw e;
    }
    return undefined;
  }

  async getSubmission(): Promise<Submission> {
    return this.getJupyterSubmission();
  }

  async loadSubmission(request: LoadSubmission["request"]): Promise<undefined> {
    this.setJupyterLocale(request.params.language);

    try {
      console.debug(`${logModule} Loading project`);

      const { autograderFile } = await importCrtInternalTask(
        request.params.task,
      );

      await this.closeAllDocuments();

      await this.putFileContents(
        EmbeddedPythonCallbacks.autograderLocation,
        autograderFile,
      );

      await this.putFileContents(
        EmbeddedPythonCallbacks.studentTaskLocation,
        request.params.submission,
      );

      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.studentTaskLocation,
      );
    } catch (e) {
      console.error(`${logModule} Project load failure: ${e}`);

      throw e;
    }

    return undefined;
  }

  async setLocale(request: SetLocale["request"]): Promise<undefined> {
    this.setJupyterLocale(request.params);

    return undefined;
  }

  private async setJupyterLocale(_language: Language): Promise<void> {
    // TODO: needs to be implemented
  }

  // @ts-expect-error will be needed in the future
  private _getJupyterLocale(language: Language): string {
    switch (language) {
      case Language.fr:
        return "fr-FR";
      case Language.en:
      default:
        return "en-US";
    }
  }

  private async closeAllDocuments(): Promise<void> {
    // close all open files
    const widgets = this.app.shell.widgets("main");
    const widgetList = Array.from(widgets);

    // Filter to only document widgets
    const documentWidgets = widgetList.filter(
      (w) => !!this.documentManager.contextForWidget(w),
    );

    // Create promises that resolve when each widget is disposed
    const closePromises = documentWidgets.map(
      (widget) =>
        new Promise<void>((resolve) => {
          widget.disposed.connect(() => resolve());
          widget.dispose();
        }),
    );

    // Wait until all have been disposed
    await Promise.all(closePromises);
  }

  private async getJupyterSubmission(): Promise<Submission> {
    console.debug(`${logModule} Getting submission from Jupyter`);
    const results: OtterGradingResults =
      await this.app.commands.execute(runGradingCommand);

    console.debug(`${logModule} Grading results:`, JSON.stringify(results));

    const submission = await this.getFileContents(
      EmbeddedPythonCallbacks.studentTaskLocation,
    );

    return {
      failedTests: results.tests
        .filter(
          (t) =>
            t.score !== undefined &&
            t.max_score !== undefined &&
            t.score < t.max_score,
        )
        .map((t) => ({
          contextName: EmbeddedPythonCallbacks.studentTaskLocation,
          identifier: t.name,
          name: t.name,
        })),
      passedTests: results.tests
        .filter(
          (t) =>
            t.score !== undefined &&
            t.max_score !== undefined &&
            t.score >= t.max_score,
        )
        .map((t) => ({
          contextName: EmbeddedPythonCallbacks.studentTaskLocation,
          identifier: t.name,
          name: t.name,
        })),
      file: submission,
    };
  }

  private async createFolder(path: string, name: string): Promise<void> {
    try {
      await this.app.serviceManager.contents.save(path, {
        type: "directory",
        name,
      });
    } catch (error) {
      if (hasStatus(error, 409)) {
        // Folder already exists, we can ignore this error
        return;
      }

      throw error;
    }
  }

  private async putFileContents(path: string, content: Blob): Promise<void> {
    // create directories if needed
    await this.createDirectoryPath(path);

    if (content.type === "text/plain" || path.endsWith(".txt")) {
      const textContent = await content.text();
      await this.app.serviceManager.contents.save(path, {
        type: "file",
        format: "text",
        content: textContent,
      });
    } else if (
      content.type === "application/json" ||
      path.endsWith(".ipynb") ||
      path.endsWith(".json")
    ) {
      const jsonContent = await content.text();

      await this.app.serviceManager.contents.save(path, {
        type: "file",
        format: "json",
        content: JSON.parse(jsonContent),
      });
    } else {
      // For binary files, we save as base64
      const base64Content = await content.arrayBuffer();
      const base64String = btoa(
        String.fromCharCode(...new Uint8Array(base64Content)),
      );

      await this.app.serviceManager.contents.save(path, {
        type: "file",
        format: "base64",
        content: base64String,
      });
    }

    // since we put new content, refresh the file browser
    await this.fileBrowser.model.refresh();
  }

  private async getFileContents(path: string): Promise<Blob> {
    const file = await this.app.serviceManager.contents.get(path, {
      content: true,
    });

    if (file.format == "text") {
      return new Blob([file.content], {
        type: "text/plain",
      });
    } else if (file.format == "json") {
      return new Blob([JSON.stringify(file.content)], {
        type: "application/json",
      });
    } else if (file.format == "base64") {
      const byteNumbers = Array.from(atob(file.content)).map((char) =>
        char.charCodeAt(0),
      );

      const byteArray = new Uint8Array(byteNumbers);

      return new Blob([byteArray], {
        type: file.mimetype || "application/octet-stream",
      });
    } else {
      throw new Error(`Unsupported content format: ${file.format}`);
    }
  }

  private async createDirectoryPath(path: string): Promise<void> {
    const pathParts = path.split("/").filter((part) => part !== "");

    if (pathParts.length <= 1) {
      // No need to create folders
      return;
    }

    let currentPath = "";

    // Create all folders along the path
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath = currentPath
        ? `${currentPath}/${pathParts[i]}`
        : `/${pathParts[i]}`;

      await this.createFolder(currentPath, pathParts[i]);
    }
  }

  private async getFolderContents(path: string): Promise<Map<string, Blob>> {
    const files = new Map<string, Blob>();

    try {
      const folder = await this.app.serviceManager.contents.get(path, {
        content: true,
      });

      if (folder.type !== "directory") {
        throw new DirectoryNotFoundError(path);
      }

      for (const item of folder.content) {
        const itemPath = `${path}/${item.name}`;

        if (item.type === "directory") {
          // Recursively read subdirectories
          const subFiles = await this.getFolderContents(itemPath);
          for (const [subPath, blob] of subFiles.entries()) {
            files.set(`${item.name}/${subPath}`, blob);
          }
        } else if (item.type === "file" || item.type === "notebook") {
          const fileContent = await this.getFileContents(itemPath);
          files.set(item.name, fileContent);
        } else {
          console.warn(
            `${logModule} Unsupported item type in folder ${path}: ${item.type}`,
          );
        }
      }
    } catch {
      console.debug(`${logModule} Folder ${path} not found, skipping`);
    }

    return files;
  }

  private async writeFolderContents(
    basePath: string,
    files: Directory,
  ): Promise<void> {
    for (const [relativePath, blob] of files.entries()) {
      const path = `${basePath}/${relativePath}`;
      await this.putFileContents(path, blob);
    }
  }

  private async writeCrtInternalTask(task: CrtInternalTask): Promise<void> {
    await this.putFileContents(
      EmbeddedPythonCallbacks.studentTaskLocation,
      task.studentTaskFile,
    );
    await this.putFileContents(
      EmbeddedPythonCallbacks.autograderLocation,
      task.autograderFile,
    );
    await this.writeFolderContents(
      EmbeddedPythonCallbacks.dataLocation,
      task.data,
    );
    await this.writeFolderContents(
      EmbeddedPythonCallbacks.srcLocation,
      task.src,
    );

    if (this.mode == Mode.edit) {
      await this.putFileContents(
        EmbeddedPythonCallbacks.taskTemplateLocation,
        task.taskTemplateFile,
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingDataLocation,
        task.gradingData,
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingSrcLocation,
        task.gradingSrc,
      );
      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.taskTemplateLocation,
      );
    } else {
      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.studentTaskLocation,
      );
    }
  }

  private async writeGenericNotebookTask(
    task: GenericNotebookTask,
  ): Promise<void> {
    await this.putFileContents(
      EmbeddedPythonCallbacks.taskTemplateLocation,
      task.taskFile,
    );

    await this.writeFolderContents(
      EmbeddedPythonCallbacks.dataLocation,
      task.data,
    );

    await this.writeFolderContents(
      EmbeddedPythonCallbacks.gradingDataLocation,
      task.gradingData,
    );

    await this.writeFolderContents(
      EmbeddedPythonCallbacks.srcLocation,
      task.src,
    );

    await this.writeFolderContents(
      EmbeddedPythonCallbacks.gradingSrcLocation,
      task.gradingSrc,
    );

    this.documentManager.openOrReveal(
      EmbeddedPythonCallbacks.taskTemplateLocation,
    );
  }

  private async getAllFolderContents(): Promise<{
    data: Directory;
    gradingData: Directory;
    src: Directory;
    gradingSrc: Directory;
  }> {
    return {
      data: await this.getFolderContents(EmbeddedPythonCallbacks.dataLocation),
      gradingData: await this.getFolderContents(
        EmbeddedPythonCallbacks.gradingDataLocation,
      ),
      src: await this.getFolderContents(EmbeddedPythonCallbacks.srcLocation),
      gradingSrc: await this.getFolderContents(
        EmbeddedPythonCallbacks.gradingSrcLocation,
      ),
    } satisfies SharedDirectories;
  }
}

export const setupIframeApi = (
  callbacks: EmbeddedPythonCallbacks,
): AppCrtIframeApi => {
  return initIframeApi({
    getHeight: callbacks.getHeight.bind(callbacks),
    getSubmission: callbacks.getSubmission.bind(callbacks),
    getTask: callbacks.getTask.bind(callbacks),
    loadTask: callbacks.loadTask.bind(callbacks),
    loadSubmission: callbacks.loadSubmission.bind(callbacks),
    setLocale: callbacks.setLocale.bind(callbacks),
    importTask: callbacks.importTask.bind(callbacks),
    exportTask: callbacks.exportTask.bind(callbacks),
  });
};

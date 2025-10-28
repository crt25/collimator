import { JupyterFrontEnd } from "@jupyterlab/application";
import JSZip from "jszip";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { FileBrowser } from "@jupyterlab/filebrowser";

import { ITranslator } from "@jupyterlab/translation";

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
  ExternalCustomTask,
  FileMap,
  importCrtInternalTask,
  importExternalCustomTask,
} from "./task-importer";
import { detectTaskFormat } from "./format-detector";
import { ImportTask } from "./iframe-rpc/src/methods/import-task";
import { TaskFormat } from "./task-format";

import { getMessage, MessageKeys } from "./translator";
import { showErrorMessage, showSuccessMessage } from "./notifications";
import {
  DirectoryNotFoundError,
  FileSystemError,
  FolderAlreadyExistsError,
} from "./errors/task-errors";

const logModule = "[Embedded Jupyter]";

const initIframeApi = (handleRequest: AppHandleRequestMap): void => {
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

  private static readonly taskTemplateInZip: string = "template.ipynb";
  private static readonly studentTaskInZip: string = "student.ipynb";
  private static readonly autograderInZip: string = "autograder.zip";

  constructor(
    private readonly mode: Mode,
    private readonly app: JupyterFrontEnd,
    private readonly documentManager: IDocumentManager,
    private readonly fileBrowser: FileBrowser,
    private readonly translator: ITranslator,
  ) {}

  async getHeight(): Promise<number> {
    return document.body.scrollHeight;
  }

  async getTask(request: GetTask["request"]): Promise<Task> {
    // generate student task and autograder
    await this.app.commands.execute(runAssignCommand);

    const initialSolution = await this.getJupyterSubmission();
    const studentTask = initialSolution.file;

    const taskTemplate = await this.getFileContents(
      EmbeddedPythonCallbacks.taskTemplateLocation,
    );

    const autograder = await this.getFileContents(
      EmbeddedPythonCallbacks.autograderLocation,
    );

    const task = await this.packTask(taskTemplate, studentTask, autograder);

    try {
      return {
        file: task,
        initialSolution,
      };
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      const errorMessage = e instanceof Error ? e.message : String(e);
      showErrorMessage(
        getMessage(this.translator, MessageKeys.CannotGetTask, {
          error: errorMessage,
        }),
      );

      throw e;
    }
  }

  async loadTask(request: LoadTask["request"]): Promise<undefined> {
    try {
      this.setJupyterLocale(request.params.language);

      console.debug(`${logModule} Loading project`);
      const unpacked = await this.unpackTask(request.params.task);

      await this.closeAllDocuments();

      if (this.mode == Mode.edit) {
        await this.putFileContents(
          EmbeddedPythonCallbacks.taskTemplateLocation,
          unpacked.taskTemplateFile,
        );

        await this.createFolder(EmbeddedPythonCallbacks.dataLocation, "data");
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.dataLocation,
          unpacked.data,
        );

        await this.createFolder(
          EmbeddedPythonCallbacks.gradingDataLocation,
          "grading_data",
        );
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.gradingDataLocation,
          unpacked.gradingData,
        );

        await this.createFolder(EmbeddedPythonCallbacks.srcLocation, "src");
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.srcLocation,
          unpacked.src,
        );

        await this.createFolder(
          EmbeddedPythonCallbacks.gradingSrcLocation,
          "grading_src",
        );
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.gradingSrcLocation,
          unpacked.gradingSrc,
        );

        await this.createFolder("/student", "student");
        await this.putFileContents(
          EmbeddedPythonCallbacks.studentTaskLocation,
          unpacked.studentTaskFile,
        );

        await this.createFolder("/autograder", "autograder");
        await this.putFileContents(
          EmbeddedPythonCallbacks.autograderLocation,
          unpacked.autograderFile,
        );

        this.documentManager.openOrReveal(
          EmbeddedPythonCallbacks.taskTemplateLocation,
        );
      } else {
        await this.createFolder("/student", "student");
        await this.createFolder("/autograder", "autograder");

        await this.putFileContents(
          EmbeddedPythonCallbacks.studentTaskLocation,
          unpacked.studentTaskFile,
        );

        await this.putFileContents(
          EmbeddedPythonCallbacks.autograderLocation,
          unpacked.autograderFile,
        );

        await this.createFolder(EmbeddedPythonCallbacks.dataLocation, "data");
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.dataLocation,
          unpacked.data,
        );

        await this.createFolder(EmbeddedPythonCallbacks.srcLocation, "src");
        await this.writeFolderContents(
          EmbeddedPythonCallbacks.srcLocation,
          unpacked.src,
        );

        this.documentManager.openOrReveal(
          EmbeddedPythonCallbacks.studentTaskLocation,
        );
      }

      showSuccessMessage(getMessage(this.translator, MessageKeys.TaskImported));
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      const errorMessage = e instanceof Error ? e.message : String(e);

      showErrorMessage(
        getMessage(this.translator, MessageKeys.CannotLoadProject, {
          error: errorMessage,
        }),
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

          await this.writeCrtInternalTaskOnEditMode(importedCrtInternalFiles);

          break;
        }

        case TaskFormat.ExternalCustom: {
          const importedExternalFiles = await importExternalCustomTask(
            request.params.task,
          );

          await this.writeExternalCustomTaskOnEditMode(importedExternalFiles);

          break;
        }
      }

      showSuccessMessage(getMessage(this.translator, MessageKeys.TaskImported));
    } catch (e) {
      console.error(
        `${logModule} RPC: ${request.method} failed with error:`,
        e,
      );

      const errorMessage = e instanceof Error ? e.message : String(e);

      showErrorMessage(
        getMessage(this.translator, MessageKeys.CannotImportTask, {
          error: errorMessage,
        }),
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

      const { autograderFile } = await this.unpackTask(request.params.task);

      await this.closeAllDocuments();

      await this.createFolder("/student", "student");
      await this.createFolder("/autograder", "autograder");

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

      showSuccessMessage(getMessage(this.translator, MessageKeys.TaskLoaded));
    } catch (e) {
      console.error(`${logModule} Project load failure: ${e}`);

      const errorMessage = e instanceof Error ? e.message : String(e);

      showErrorMessage(
        getMessage(this.translator, MessageKeys.CannotLoadProject, {
          error: errorMessage,
        }),
      );

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

  private async packTask(
    taskTemplate: Blob,
    studentTask: Blob,
    autograder: Blob,
  ): Promise<Blob> {
    const zip = new JSZip();
    zip.file(EmbeddedPythonCallbacks.taskTemplateInZip, taskTemplate);
    zip.file(EmbeddedPythonCallbacks.studentTaskInZip, studentTask);
    zip.file(EmbeddedPythonCallbacks.autograderInZip, autograder);

    const data = await this.readFolderContents(
      EmbeddedPythonCallbacks.dataLocation,
    );

    const src = await this.readFolderContents(
      EmbeddedPythonCallbacks.srcLocation,
    );

    const gradingData = await this.readFolderContents(
      EmbeddedPythonCallbacks.gradingDataLocation,
    );

    const gradingSrc = await this.readFolderContents(
      EmbeddedPythonCallbacks.gradingSrcLocation,
    );

    for (const [relativePath, blob] of data.entries()) {
      zip.file(`data/${relativePath}`, blob);
    }

    for (const [relativePath, blob] of src.entries()) {
      zip.file(`src/${relativePath}`, blob);
    }

    for (const [relativePath, blob] of gradingData.entries()) {
      zip.file(`grading_data/${relativePath}`, blob);
    }

    for (const [relativePath, blob] of gradingSrc.entries()) {
      zip.file(`grading_src/${relativePath}`, blob);
    }

    return zip.generateAsync({ type: "blob" });
  }

  private async unpackTask(task: Blob): Promise<CrtInternalTask> {
    const importedFiles = await importCrtInternalTask(task);

    return {
      taskTemplateFile: importedFiles.taskTemplateFile,
      studentTaskFile: importedFiles.studentTaskFile,
      autograderFile: importedFiles.autograderFile,
      data: importedFiles.data,
      src: importedFiles.src,
      gradingData: importedFiles.gradingData,
      gradingSrc: importedFiles.gradingSrc,
    };
  }

  private async createFolder(path: string, name: string): Promise<void> {
    await this.app.serviceManager.contents.save(path, {
      type: "directory",
      name,
    });
  }

  private async putFileContents(path: string, content: Blob): Promise<void> {
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

  private async writeFolderContents(
    basePath: string,
    files: FileMap,
  ): Promise<void> {
    for (const [relativePath, blob] of files.entries()) {
      const path = `${basePath}/${relativePath}`;
      const pathParts = relativePath.split("/");

      // Create all folders along the path
      if (pathParts.length > 1) {
        let currentPath = basePath;

        for (let i = 0; i < pathParts.length - 1; i++) {
          currentPath += `/${pathParts[i]}`;

          try {
            await this.createFolder(currentPath, pathParts[i]);
          } catch (error) {
            // folder may already exist, ignore errors
            if (!(error instanceof FolderAlreadyExistsError)) {
              throw error;
            }
          }
        }
      }
      await this.putFileContents(path, blob);
    }
  }

  private async readFolderContents(
    basePath: string,
  ): Promise<Map<string, Blob>> {
    const files = new Map<string, Blob>();

    try {
      const folder = await this.app.serviceManager.contents.get(basePath, {
        content: true,
      });

      if (folder.type !== "directory") {
        throw new DirectoryNotFoundError(basePath);
      }

      for (const item of folder.content || []) {
        const itemPath = `${basePath}/${item.name}`;

        if (item.type === "directory") {
          const subFiles = await this.readFolderContents(itemPath);

          for (const [subPath, blob] of subFiles.entries()) {
            files.set(`${item.path}/${subPath}`, blob);
          }
        } else {
          const blob = await this.getFileContents(itemPath);

          files.set(item.path, blob);
        }
      }
    } catch (e) {
      // Throw FileSystemError for any error encountered during reading
      const error = e instanceof Error ? e : undefined;
      throw new FileSystemError("read folder", basePath, error);
    }
    return files;
  }

  private async writeCrtInternalTaskOnEditMode(
    importedFiles: CrtInternalTask,
  ): Promise<void> {
    if (this.mode == Mode.edit) {
      await this.putFileContents(
        EmbeddedPythonCallbacks.taskTemplateLocation,
        importedFiles.taskTemplateFile,
      );

      await this.createFolder(EmbeddedPythonCallbacks.dataLocation, "data");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.dataLocation,
        importedFiles.data,
      );

      await this.createFolder(
        EmbeddedPythonCallbacks.gradingDataLocation,
        "grading_data",
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingDataLocation,
        importedFiles.gradingData,
      );

      await this.createFolder("/student", "student");
      await this.putFileContents(
        EmbeddedPythonCallbacks.studentTaskLocation,
        importedFiles.studentTaskFile,
      );

      await this.createFolder("/autograder", "autograder");
      await this.putFileContents(
        EmbeddedPythonCallbacks.autograderLocation,
        importedFiles.autograderFile,
      );
      await this.createFolder(EmbeddedPythonCallbacks.srcLocation, "src");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.srcLocation,
        importedFiles.src,
      );

      await this.createFolder(
        EmbeddedPythonCallbacks.gradingSrcLocation,
        "grading_src",
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingSrcLocation,
        importedFiles.gradingSrc,
      );

      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.taskTemplateLocation,
      );
    } else {
      await this.createFolder("/student", "student");
      await this.createFolder("/autograder", "autograder");

      await this.putFileContents(
        EmbeddedPythonCallbacks.studentTaskLocation,
        importedFiles.studentTaskFile,
      );

      await this.putFileContents(
        EmbeddedPythonCallbacks.autograderLocation,
        importedFiles.autograderFile,
      );

      await this.createFolder(EmbeddedPythonCallbacks.dataLocation, "data");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.dataLocation,
        importedFiles.data,
      );

      await this.createFolder(EmbeddedPythonCallbacks.srcLocation, "src");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.srcLocation,
        importedFiles.src,
      );

      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.studentTaskLocation,
      );
    }
  }

  private async writeExternalCustomTaskOnEditMode(
    importedFiles: ExternalCustomTask,
  ): Promise<void> {
    if (this.mode == Mode.edit) {
      await this.putFileContents(
        EmbeddedPythonCallbacks.taskTemplateLocation,
        importedFiles.taskFile,
      );

      await this.createFolder(EmbeddedPythonCallbacks.dataLocation, "data");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.dataLocation,
        importedFiles.data,
      );

      await this.createFolder(
        EmbeddedPythonCallbacks.gradingDataLocation,
        "grading_data",
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingDataLocation,
        importedFiles.gradingData,
      );

      await this.createFolder(EmbeddedPythonCallbacks.srcLocation, "src");
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.srcLocation,
        importedFiles.src,
      );

      await this.createFolder(
        EmbeddedPythonCallbacks.gradingSrcLocation,
        "grading_src",
      );
      await this.writeFolderContents(
        EmbeddedPythonCallbacks.gradingSrcLocation,
        importedFiles.gradingSrc,
      );

      this.documentManager.openOrReveal(
        EmbeddedPythonCallbacks.taskTemplateLocation,
      );
    } else {
      throw new Error(
        "External custom task import is only supported in edit mode",
      );
    }
  }
}

export const setupIframeApi = (callbacks: EmbeddedPythonCallbacks): void => {
  initIframeApi({
    getHeight: callbacks.getHeight.bind(callbacks),
    getSubmission: callbacks.getSubmission.bind(callbacks),
    getTask: callbacks.getTask.bind(callbacks),
    loadTask: callbacks.loadTask.bind(callbacks),
    loadSubmission: callbacks.loadSubmission.bind(callbacks),
    setLocale: callbacks.setLocale.bind(callbacks),
    importTask: callbacks.importTask.bind(callbacks),
  });
};

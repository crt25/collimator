import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { ICommandPalette } from "@jupyterlab/apputils";
import { ContentsManager, IContentsManager } from "@jupyterlab/services";
import { IStatusBar } from "@jupyterlab/statusbar";
import { IRunningSessionSidebar } from "@jupyterlab/running";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IPropertyInspectorProvider } from "@jupyterlab/property-inspector";
import { ISettingRegistry } from "@jupyterlab/settingregistry";
import { IFileBrowserFactory } from "@jupyterlab/filebrowser";
import { getModeFromUrl, Mode } from "./mode";
import { EmbeddedPythonCallbacks, setupIframeApi } from "./iframe-api";
import { simplifyUserInterface } from "./user-interface";
import { registerCommands } from "./commands";
import { preInstallPackages } from "./packages";
import { TaskAutoSaver } from "./auto-save/task-auto-saver";
import { enableSentry } from "./sentry";

enableSentry();

/**
 * Initialization data for the notebook-runner extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "notebook-runner:plugin",
  description:
    "A JupyterLab extension that exposes javascript functions to run notebook cells to the pyodide kernel.",
  autoStart: true,
  requires: [
    INotebookTracker,
    IContentsManager,
    IDocumentManager,
    IStatusBar,
    IRunningSessionSidebar,
    ICommandPalette,
    IPropertyInspectorProvider,
    IFileBrowserFactory,
    ISettingRegistry,
  ],
  activate: async (
    app: JupyterFrontEnd,
    notebookTracker: INotebookTracker,
    contentsManager: ContentsManager,
    documentManager: IDocumentManager,
    _statusBar: IStatusBar,
    runningSessions: IRunningSessionSidebar,
    _commandPalette: ICommandPalette,
    propertyInspectorProvider: IPropertyInspectorProvider,
    factory: IFileBrowserFactory,
    settingRegistry: ISettingRegistry,
  ) => {
    console.debug("JupyterLab extension notebook-runner is activated!");

    // The default file browser instance
    const fileBrowser = factory.tracker.find(
      (widget) => widget.id === "filebrowser",
    );

    if (!fileBrowser) {
      console.warn("No default file browser found");
      return;
    }

    const mode = getModeFromUrl();

    preInstallPackages(app, contentsManager, notebookTracker);
    const platform = setupIframeApi(
      new EmbeddedPythonCallbacks(
        mode,
        app,
        documentManager,
        fileBrowser,
        settingRegistry,
      ),
    );

    if (mode === Mode.solve) {
      TaskAutoSaver.trackNotebook(
        notebookTracker,
        platform.sendRequest.bind(platform),
      );
    }

    simplifyUserInterface(
      mode,
      app,
      runningSessions,
      propertyInspectorProvider,
      fileBrowser,
    );

    registerCommands(app, notebookTracker, contentsManager, documentManager);

    app.restored.then(async () => {
      // Only open the template notebook in edit mode.
      // In solve or show mode, the correct notebook (student task) will be
      // opened by the loadTask/loadSubmission RPC call from the parent.
      if (mode === Mode.edit) {
        try {
          documentManager.openOrReveal(
            EmbeddedPythonCallbacks.taskTemplateLocation,
          );
        } catch (error) {
          console.error("Could not open template in edit mode:", error);
        }
      }
    });
  },
};

export default plugin;

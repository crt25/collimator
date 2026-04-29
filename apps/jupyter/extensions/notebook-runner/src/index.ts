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
import { installPackagesWithLoadingState } from "./packages";
import { TaskAutoSaver } from "./auto-save/task-auto-saver";
import { enableSentry } from "./sentry";
import { LoadingStateManager } from "./loading-state";
import { sendMessage } from "./send-message";
import { ToastType } from "./iframe-rpc/src";
import { messages } from "./i18n/messages";
import { formatMessage, setIntlLocale } from "./i18n/intl";
import { toCrtLocale } from "./languages";

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

    const callbacks = new EmbeddedPythonCallbacks(
      mode,
      app,
      documentManager,
      fileBrowser,
      settingRegistry,
    );
    const platform = setupIframeApi(callbacks);

    try {
      const translationSettings = await settingRegistry.load(
        EmbeddedPythonCallbacks.pluginId,
      );

      const rawLocale = translationSettings.get("locale").composite;
      if (typeof rawLocale === "string") {
        setIntlLocale(toCrtLocale(rawLocale));
      }
    } catch (error) {
      console.error("Failed to read locale for notebook-runner i18n:", error);
      await sendMessage(
        formatMessage(messages.localeReadFailedTitle),
        formatMessage(messages.localeReadFailedBody),
        ToastType.Error,
        platform.sendRequest.bind(platform),
      ).catch((error) => {
        console.error("Failed to show locale read error notification", error);
      });
    }

    if (mode === Mode.solve) {
      const taskAutoSaver = TaskAutoSaver.trackNotebook(
        notebookTracker,
        platform.sendRequest.bind(platform),
      );

      callbacks.addBeforeReloadCallback(() => taskAutoSaver.saveAllNotebooks());
    }

    simplifyUserInterface(
      mode,
      app,
      runningSessions,
      propertyInspectorProvider,
      fileBrowser,
      documentManager,
    );

    registerCommands(
      app,
      notebookTracker,
      contentsManager,
      documentManager,
      platform.sendRequest.bind(platform),
    );

    const loadingStateManager = new LoadingStateManager(
      settingRegistry,
      platform.sendRequest.bind(platform),
    );

    try {
      await installPackagesWithLoadingState(
        app,
        contentsManager,
        notebookTracker,
        loadingStateManager,
      );
    } catch (error) {
      console.error("Failed to initialize package installation flow:", error);

      await sendMessage(
        formatMessage(messages.initFailedTitle),
        formatMessage(messages.initFailedBody),
        ToastType.Error,
        platform.sendRequest.bind(platform),
      ).catch((messageError) => {
        console.error(
          "Failed to show initialization error notification:",
          messageError,
        );
      });
    }

    app.restored.then(() => {
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

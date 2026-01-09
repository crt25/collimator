import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { ICommandPalette } from "@jupyterlab/apputils";
import { ContentsManager, IContentsManager } from "@jupyterlab/services";
import { IStatusBar } from "@jupyterlab/statusbar";
import { ITranslator } from "@jupyterlab/translation";
import { IRunningSessionSidebar } from "@jupyterlab/running";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { INotebookTracker } from "@jupyterlab/notebook";
import { IPropertyInspectorProvider } from "@jupyterlab/property-inspector";
import { IFileBrowserFactory } from "@jupyterlab/filebrowser";
import * as Sentry from "@sentry/browser";
import { getModeFromUrl } from "./mode";
import { EmbeddedPythonCallbacks, setupIframeApi } from "./iframe-api";
import { simplifyUserInterface } from "./user-interface";
import { registerCommands } from "./commands";
import { preInstallPackages } from "./packages";
import { VERSION } from "./version";

const defaultNotebookPath = EmbeddedPythonCallbacks.taskTemplateLocation;
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
    ITranslator,
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
  ) => {
    // Check if running on localhost, i.e. in a development environment
    const isProductionEnvironment = window.location.hostname !== "localhost";

    Sentry.init({
      dsn: "https://2b691a9ac828880dda066b5be1ae9873@o4508199129382912.ingest.de.sentry.io/4510680604016720",

      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/configuration/options/#sendDefaultPii
      sendDefaultPii: true,

      // Alternatively, use `process.env.npm_package_version` for a dynamic release version
      // if your build tool supports it.
      release: `crt-jupyter@${VERSION}`,
      enabled: isProductionEnvironment,
      environment: isProductionEnvironment ? "production" : "development",
    });

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
    setupIframeApi(
      new EmbeddedPythonCallbacks(mode, app, documentManager, fileBrowser),
    );

    simplifyUserInterface(
      mode,
      app,
      runningSessions,
      propertyInspectorProvider,
      fileBrowser,
    );

    registerCommands(app, notebookTracker, contentsManager, documentManager);

    // Open the default notebook (if it exists) once the application has loaded
    app.restored.then(() => documentManager.openOrReveal(defaultNotebookPath));
  },
};

export default plugin;

import { JupyterFrontEnd } from "@jupyterlab/application";
import { IRunningSessionSidebar } from "@jupyterlab/running";
import { IPropertyInspectorProvider } from "@jupyterlab/property-inspector";
import { FileBrowser } from "@jupyterlab/filebrowser";
import { Contents } from "@jupyterlab/services";
import { KnownWidget } from "./known-widget";
import { Mode } from "./mode";
import { WidgetArea } from "./widget-area";

export const hiddenFolders = ["grading_src", "grading_data"];

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
): Promise<void> => {
  if (mode !== Mode.edit) {
    // @ts-expect-error The exposed type is not complete
    propertyInspectorProvider.dispose();
    // @ts-expect-error The exposed type is not complete
    runningSessions.dispose();

    hideGradingFolders(fileBrowser);
  }

  // activate simple mode
  await app.commands.execute("application:toggle-mode");
  // hide the status bar
  await app.commands.execute("statusbar:toggle");

  hideDisallowedWidgets(mode, app);
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

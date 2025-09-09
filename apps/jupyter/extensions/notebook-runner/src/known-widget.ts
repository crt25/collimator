export enum KnownWidget {
  // These values were found by logging the loaded widgets and inspecting their identifiers.
  // They may change with future versions of JupyterLite / the extensions and there does not seem to be
  // an official list of them.
  filebrowser = "filebrowser",
  runningSessions = "jp-running-sessions",
  commandPalette = "command-palette",
  tableOfContents = "table-of-contents",
  propertyInspector = "jp-property-inspector",
  mainLogo = "jp-MainLogo",
  menuBar = "jp-menu-panel",
  mainMenu = "jp-MainMenu",
  titlePanel = "jp-title-panel-title",
  topBar = "jp-top-bar",
  statusBar = "jp-main-statusbar",
}

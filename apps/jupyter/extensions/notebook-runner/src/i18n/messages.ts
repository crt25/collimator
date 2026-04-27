import { defineMessages } from "react-intl";

export const messages = defineMessages({
  initFailedTitle: {
    id: "crt.notebookRunner.initFailedTitle",
    defaultMessage: "Initialization Failed",
  },
  initFailedBody: {
    id: "crt.notebookRunner.initFailedBody",
    defaultMessage:
      "Failed to initialize the notebook environment. Please reload the page to try again.",
  },
  loadingTaskTitle: {
    id: "crt.notebookRunner.loadingTaskTitle",
    defaultMessage: "Loading Task",
  },
  loadingTaskBody: {
    id: "crt.notebookRunner.loadingTaskBody",
    defaultMessage:
      "Please wait while the task is being prepared. Code execution is temporarily disabled while packages are being installed...",
  },
  taskReadyTitle: {
    id: "crt.notebookRunner.taskReadyTitle",
    defaultMessage: "Task Ready",
  },
  taskReadyBody: {
    id: "crt.notebookRunner.taskReadyBody",
    defaultMessage:
      "All packages installed successfully. Code execution is now enabled.",
  },
  taskSetupFailedTitle: {
    id: "crt.notebookRunner.taskSetupFailedTitle",
    defaultMessage: "Task Setup Failed",
  },
  taskSetupFailedBody: {
    id: "crt.notebookRunner.taskSetupFailedBody",
    defaultMessage:
      "An error occurred while preparing the task. Please reload the page or contact support.",
  },
  packageInstallationFailedTitle: {
    id: "crt.notebookRunner.packageInstallationFailedTitle",
    defaultMessage: "Package Installation Failed",
  },
  packageInstallationFailedBody: {
    id: "crt.notebookRunner.packageInstallationFailedBody",
    defaultMessage:
      "Cannot run cells because package installation failed. Please reload the page and try again.",
  },
  localeReadFailedTitle: {
    id: "crt.notebookRunner.localeReadFailedTitle",
    defaultMessage: "Translation Failed",
  },
  localeReadFailedBody: {
    id: "crt.notebookRunner.localeReadFailedBody",
    defaultMessage:
      "An error occurred while reading the locale for translation. Please reload the page or contact support.",
  },
} as const);

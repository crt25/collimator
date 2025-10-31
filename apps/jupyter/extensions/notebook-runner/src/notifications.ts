import { Notification } from "@jupyterlab/apputils";

export const showErrorMessage = (message: string): void => {
  Notification.error(message, { autoClose: 4000 });
};

export const showSuccessMessage = (message: string): void => {
  Notification.success(message, { autoClose: 4000 });
};

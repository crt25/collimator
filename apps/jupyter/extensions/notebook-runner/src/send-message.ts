import { FailedToSendMessageError } from "./errors/task-errors";
import { AppCrtIframeApi, ToastType } from "./iframe-rpc/src";

export const sendMessage = async (
  title: string,
  message: string,
  toastType: ToastType,
  sendRequest: AppCrtIframeApi["sendRequest"],
): Promise<void> => {
  try {
    await sendRequest("postMessage", {
      title,
      message,
      type: toastType,
    });
  } catch (error) {
    throw new FailedToSendMessageError(
      error instanceof Error ? error.message : error,
    );
  }
};

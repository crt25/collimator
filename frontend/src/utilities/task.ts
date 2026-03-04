import { IntlShape, MessageDescriptor } from "react-intl";
import { toaster } from "@/components/Toaster";

const toastDuration = 60 * 1000;

type MessageDescriptorWithError = MessageDescriptor & {
  defaultMessage: `${string}{error}${string}`;
};

type ErrorMessage =
  | string
  | {
      intl: IntlShape;
      descriptor: MessageDescriptorWithError;
      values?: Record<string, unknown>;
    };

const getErrorDetail = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};

const formatErrorMessage = (
  errorMessage: ErrorMessage,
  error: unknown,
): string => {
  if (typeof errorMessage === "string") {
    return errorMessage;
  }

  return errorMessage.intl.formatMessage(errorMessage.descriptor, {
    ...errorMessage.values,
    error: getErrorDetail(error),
  });
};

export const executeAsyncWithToasts = async <T>(
  fn: () => Promise<T>,
  errorMessage: ErrorMessage,
  successMessage?: string,
): Promise<T> => {
  try {
    const response = await fn();
    if (successMessage) {
      toaster.success({
        title: successMessage,
        closable: true,
        duration: toastDuration,
      });
    }

    return response;
  } catch (error) {
    toaster.error({
      title: formatErrorMessage(errorMessage, error),
      closable: true,
      duration: toastDuration,
    });

    throw error;
  }
};

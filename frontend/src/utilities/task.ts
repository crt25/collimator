import { IntlShape, MessageDescriptor } from "react-intl";
import { IframeDocumentReplacedError } from "iframe-rpc-react/src";
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
        id: `success-${Date.now()}`,
        title: successMessage,
        closable: true,
        duration: toastDuration,
      });
    }

    return response;
  } catch (error) {
    // iframe navigation cancels work owned by the document that disappeared
    // replacing it retries initialization, so reporting this expected cancellation as an application failure would be misleading
    if (error instanceof IframeDocumentReplacedError) {
      throw error;
    }

    toaster.error({
      id: `error-${Date.now()}`,
      title: formatErrorMessage(errorMessage, error),
      closable: true,
      duration: toastDuration,
    });

    throw error;
  }
};

export const executeWithToasts = <T>(
  fn: () => T,
  errorMessage: string,
  successMessage?: string,
): T => {
  try {
    const response = fn();
    if (successMessage) {
      toaster.success({
        id: `success-${Date.now()}`,
        title: successMessage,
        closable: true,
        duration: toastDuration,
      });
    }
    return response;
  } catch (error) {
    toaster.error({
      id: `error-${Date.now()}`,
      title: errorMessage,
      closable: true,
      duration: toastDuration,
    });
    throw error;
  }
};

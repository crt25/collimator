import { ReactNode } from "react";
import { toaster } from "@/components/Toaster";

const toastDuration = 60 * 1000;

export const executeAsyncWithToasts = async <T>(
  fn: () => Promise<T>,
  successMessage: ReactNode,
  errorMessage: ReactNode,
): Promise<T> => {
  try {
    const response = await fn();
    toaster.success({
      title: successMessage,
      closable: true,
      duration: toastDuration,
    });
    return response;
  } catch (error) {
    toaster.error({
      title: errorMessage,
      closable: true,
      duration: toastDuration,
    });
    throw error;
  }
};

export const executeWithToasts = <T>(
  fn: () => T,
  successMessage: ReactNode,
  errorMessage: ReactNode,
): T => {
  try {
    const response = fn();
    toaster.success({
      title: successMessage,
      closable: true,
      duration: toastDuration,
    });
    return response;
  } catch (error) {
    toaster.error({
      title: errorMessage,
      closable: true,
      duration: toastDuration,
    });
    throw error;
  }
};

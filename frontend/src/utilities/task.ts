import { toaster } from "@/components/Toaster";

const toastDuration = 60 * 1000;

export const executeAsyncWithToasts = async <T>(
  fn: () => Promise<T>,
  successMessage: string,
  errorMessage: string,
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
  successMessage: string,
  errorMessage: string,
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

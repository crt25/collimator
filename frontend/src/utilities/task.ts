import { toaster } from "@/components/Toaster";

const toastDuration = 60 * 1000;

export const executeAsyncWithToasts = async <T>(
  fn: () => Promise<T>,
  errorMessage: string,
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
      title: errorMessage,
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
        title: successMessage,
        closable: true,
        duration: toastDuration,
      });
    }
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

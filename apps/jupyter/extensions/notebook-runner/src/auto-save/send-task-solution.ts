import { AppCrtIframeApi } from "../iframe-rpc/src";

export const sendTaskSolution = async (
  solution: Blob,
  sendRequest: AppCrtIframeApi["sendRequest"],
): Promise<void> => {
  try {
    await sendRequest("postTaskSolution", {
      solution,
    });
  } catch (error) {
    console.error("Failed to send solution with error:", error);
  }
};

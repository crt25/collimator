import { FailedToSendTaskSolutionError } from "../errors/task-errors";
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
    throw new FailedToSendTaskSolutionError(
      `Failed to send task solution: ${error}`,
    );
  }
};

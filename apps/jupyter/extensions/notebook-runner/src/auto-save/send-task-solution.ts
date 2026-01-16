import { JupyterContextValue } from "../jupyter-context";

export const sendTaskSolution = async (
  solution: Blob,
  sendRequest: JupyterContextValue["sendRequest"],
): Promise<void> => {
  try {
    await sendRequest("postTaskSolution", {
      solution,
    });
  } catch (error) {
    console.error("Failed to send solution with error:", error);
  }
};

import {
  StudentActionType,
  type StudentIntermediateChangeActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";

export async function sendIntermediateChangeActivity(
  data: StudentIntermediateChangeActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.IntermediateChange,
      data,
      solution,
    });
  } catch (error) {
    console.error("Error sending intermediate change activity:", error);
  }
}

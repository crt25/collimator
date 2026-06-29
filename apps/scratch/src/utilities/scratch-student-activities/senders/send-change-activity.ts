import {
  StudentActionType,
  type StudentBlockChangeActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";

export async function sendChangeActivity(
  data: StudentBlockChangeActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.BlockChange,
      data,
      solution,
    });
  } catch (error) {
    console.error("Error sending change activity:", error);
  }
}

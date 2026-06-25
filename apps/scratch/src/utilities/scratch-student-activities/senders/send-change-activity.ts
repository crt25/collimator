import {
  StudentActionType,
  type StudentChangeActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";

export async function sendChangeActivity(
  data: StudentChangeActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.ConfirmedChange,
      data,
      solution,
    });
  } catch (error) {
    console.error("Error sending change activity:", error);
  }
}

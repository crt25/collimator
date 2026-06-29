import { CrtContextValue } from "../../../contexts/CrtContext";
import {
  StudentActionType,
  type StudentDeleteActivity,
} from "../../../types/scratch-student-activities";
import { logModule } from "../log-module";

export async function sendDeleteActivity(
  data: StudentDeleteActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.Delete,
      data,
      solution,
    });
  } catch (error) {
    console.error(`${logModule} Error sending delete activity:`, error);
  }
}

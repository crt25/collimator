import {
  StudentActionType,
  type StudentBlockChangeActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { logModule } from "../log-module";

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
    console.error(`${logModule} Error sending change activity:`, error);
  }
}

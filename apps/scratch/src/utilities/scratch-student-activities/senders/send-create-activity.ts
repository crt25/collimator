import {
  StudentActionType,
  type StudentCreateActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { logModule } from "../log-module";

export async function sendCreateActivity(
  data: StudentCreateActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.Create,
      data,
      solution,
    });
  } catch (error) {
    console.error(`${logModule} Error sending create activity:`, error);
  }
}

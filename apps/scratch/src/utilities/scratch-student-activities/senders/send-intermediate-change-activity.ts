import {
  StudentActionType,
  type StudentIntermediateFieldChangeActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { logModule } from "../log-module";

export async function sendIntermediateChangeActivity(
  data: StudentIntermediateFieldChangeActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.IntermediateFieldChange,
      data,
      solution,
    });
  } catch (error) {
    console.error(
      `${logModule} Error sending intermediate change activity:`,
      error,
    );
  }
}

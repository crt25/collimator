import { StudentActionType } from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { StudentMoveActivity } from "../../../types/scratch-student-activities/move";
import { logModule } from "../log-module";

export async function sendMoveActivity(
  data: StudentMoveActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.Move,
      data,
      solution,
    });
  } catch (error) {
    console.error(`${logModule} Error sending move activity:`, error);
  }
}

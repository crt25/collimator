import { StudentActionType } from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { StudentMoveActivity } from "../../../types/scratch-student-activities/move";
import { logBaseModule } from "../log-module";

const logModule = `${logBaseModule}[senders/send-move-activity]`;

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

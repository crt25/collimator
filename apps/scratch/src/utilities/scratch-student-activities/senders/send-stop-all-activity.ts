import { StudentActionType } from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { logBaseModule } from "../log-module";

const logModule = `${logBaseModule}[senders/send-stop-all-activity]`;

export async function sendStopAllActivity(
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.StopAll,
      data: {},
      solution,
    });
  } catch (error) {
    console.error(`${logModule} Error sending stop all activity:`, error);
  }
}

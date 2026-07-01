import { StudentActionType } from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";
import { logBaseModule } from "../log-module";

const logModule = `${logBaseModule}[senders/send-green-flag-activity]`;

export async function sendGreenFlagActivity(
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentAppActivity", {
      action: StudentActionType.GreenFlag,
      data: {},
      solution,
    });
  } catch (error) {
    console.error(`${logModule} Error sending green flag activity:`, error);
  }
}

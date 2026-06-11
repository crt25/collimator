import { StudentActionType } from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";

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
    console.error("Error sending green flag activity:", error);
  }
}

import { ACTIVITY_TYPE } from "../../constants";
import type {
  MoveActivityRequest,
  StudentMoveActivity,
} from "../../../types/scratch-student-activities";

export async function sendMoveActivity(
  data: StudentMoveActivity,
  { sendRequest, action, solution }: MoveActivityRequest,
): Promise<void> {
  try {
    console.log("Sending move activity:", data, action, solution);
    await sendRequest("postStudentActivity", {
      action,
      data,
      solution,
      type: ACTIVITY_TYPE,
    });
  } catch (error) {
    console.error("Error sending move activity:", error);
  }
}

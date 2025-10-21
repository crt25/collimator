import { activityType } from "../../constants";
import type {
  MoveActivityRequest,
  StudentMoveActivity,
} from "../../../types/scratch-student-activities";

export async function sendMoveActivity(
  data: StudentMoveActivity,
  { sendRequest, action, solution }: MoveActivityRequest,
): Promise<void> {
  try {
    await sendRequest("postStudentActivity", {
      action,
      data,
      solution,
      type: activityType,
    });
  } catch (error) {
    console.error("Error sending move activity:", error);
  }
}

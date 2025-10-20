import { ACTIVITY_TYPE } from "../../constants";
import type {
  StudentDeleteActivity,
  DeleteActivityRequest,
} from "../../../types/scratch-student-activities";

export async function sendDeleteActivity(
  data: StudentDeleteActivity,
  { sendRequest, action, solution }: DeleteActivityRequest,
): Promise<void> {
  try {
    await sendRequest("postStudentActivity", {
      action,
      data,
      solution,
      type: ACTIVITY_TYPE,
    });
  } catch (error) {
    console.error("Error sending delete activity:", error);
  }
}

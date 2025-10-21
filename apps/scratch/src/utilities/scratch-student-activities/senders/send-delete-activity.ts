import { activityType } from "../../constants";
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
      type: activityType,
    });
  } catch (error) {
    console.error("Error sending delete activity:", error);
  }
}

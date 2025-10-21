import { activityType } from "../../constants";
import type {
  CreateActivityRequest,
  StudentCreateActivity,
} from "../../../types/scratch-student-activities";

export async function sendCreateActivity(
  data: StudentCreateActivity,
  { sendRequest, action, solution }: CreateActivityRequest,
): Promise<void> {
  try {
    await sendRequest("postStudentActivity", {
      action,
      data,
      solution,
      type: activityType,
    });
  } catch (error) {
    console.error("Error sending create activity:", error);
  }
}

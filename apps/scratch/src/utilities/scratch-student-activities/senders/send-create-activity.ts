import { ACTIVITY_TYPE } from "../../constants";
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
      type: ACTIVITY_TYPE,
    });
  } catch (error) {
    console.error("Error sending create activity:", error);
  }
}

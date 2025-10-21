import { activityType } from "../../constants";
import {
  StudentActionType,
  type StudentCreateActivity,
} from "../../../types/scratch-student-activities";
import { CrtContextValue } from "../../../contexts/CrtContext";

export async function sendCreateActivity(
  data: StudentCreateActivity,
  sendRequest: CrtContextValue["sendRequest"],
  solution: Blob,
): Promise<void> {
  try {
    await sendRequest("postStudentActivity", {
      action: StudentActionType.Create,
      data,
      solution,
      type: activityType,
    });
  } catch (error) {
    console.error("Error sending create activity:", error);
  }
}

import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { isTrackableStudentAction } from "./helpers";

export const shouldTrackCreateBlock = (
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean => {
  if (!isTrackableStudentAction(StudentActionType.Create, event, canEditTask)) {
    return false;
  }

  // Currently, we track all create block actions
  return true;
};

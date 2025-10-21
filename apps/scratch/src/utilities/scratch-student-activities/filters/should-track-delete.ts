import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { isTrackableStudentAction } from "./helpers";

export const shouldTrackDeleteBlock = (
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean => {
  if (!isTrackableStudentAction(StudentActionType.Delete, event, canEditTask)) {
    return false;
  }
  return true;
};

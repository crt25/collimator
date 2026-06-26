import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { isTrackableStudentAction } from "./helpers";

export const shouldTrackIntermediateChange = (
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean => {
  if (
    !isTrackableStudentAction(
      StudentActionType.IntermediateFieldChange,
      event,
      canEditTask,
    )
  ) {
    return false;
  }

  return event.oldValue !== event.newValue;
};

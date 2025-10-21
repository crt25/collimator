import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";

const trackedActions = [
  StudentActionType.Create,
  StudentActionType.Move,
  StudentActionType.Delete,
] as const;

export const isTrackableStudentAction = (
  action: StudentActionType,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined =>
  // Base filtering
  // This condition only tracks student activities (when canEditTask is false), not teacher edits
  // recordUndo is true only for direct user interactions but false for programmatic changes (e.g., vm.loadProject(projectData))
  trackedActions.includes(action) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

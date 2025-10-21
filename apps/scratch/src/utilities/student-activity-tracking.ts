import { StudentActionType } from "../types/scratch-student-activities";
import { StudentActivityHandlerParams } from "../types/scratch-student-activities";
import { processStudentActivityPipeline } from "./scratch-student-activities/pipeline";
import { mapXmlBlockToBlock } from "./scratch-block";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";

const scratchToStudentActionType: Record<string, StudentActionType> = {
  create: StudentActionType.Create,
  move: StudentActionType.Move,
  delete: StudentActionType.Delete,
};

const trackedActions = [
  StudentActionType.Create,
  StudentActionType.Move,
  StudentActionType.Delete,
] as const;

export const mapScratchEventTypeToStudentActionType = (
  type: string,
): StudentActionType | null => scratchToStudentActionType[type] || null;

export const shouldRecordStudentActionType = (
  action: StudentActionType,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined =>
  // This condition only tracks student activities (when canEditTask is false), not teacher edits
  // recordUndo is true only for direct user interactions but false for programmatic changes (e.g., vm.loadProject(projectData))
  trackedActions.includes(action) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

export const handleStudentActivityTracking = ({
  event,
  action,
  canEditTask,
  sendRequest,
  solution,
  block,
}: StudentActivityHandlerParams): void => {
  // General filtering to determine if the action should be recorded
  if (!shouldRecordStudentActionType(action, event, canEditTask)) {
    return;
  }

  switch (action) {
    case StudentActionType.Delete: {
      if (!event.oldXml) {
        return;
      }

      const block = mapXmlBlockToBlock(event.oldXml);

      if (!block) {
        return;
      }

      processStudentActivityPipeline({
        action,
        block,
        event,
        sendRequest,
        solution,
      });

      break;
    }

    case StudentActionType.Create:
    case StudentActionType.Move: {
      if (!block) {
        return;
      }

      processStudentActivityPipeline({
        action,
        block,
        event,
        sendRequest,
        solution,
      });

      break;
    }

    default:
      break;
  }
};

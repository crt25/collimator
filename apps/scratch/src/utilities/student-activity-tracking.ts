import { StudentAction } from "../types/scratch-student-activities";
import { StudentActivityHandlerParams } from "../types/scratch-student-activities";
import { processStudentActivityPipeline } from "./scratch-student-activities/pipeline";
import { mapXmlBlockToBlock } from "./scratch-block";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";

const scratchToStudentAction: Record<string, StudentAction | null> = {
  create: StudentAction.Create,
  move: StudentAction.Move,
  delete: StudentAction.Delete,
};

const TRACKED_ACTIONS = [
  StudentAction.Create,
  StudentAction.Move,
  StudentAction.Delete,
] as const;

export const mapScratchEventTypeToStudentAction = (
  type: string,
): StudentAction | null => scratchToStudentAction[type];

export const shouldRecordStudentAction = (
  action: StudentAction,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined =>
  // This condition ensures that we only track user-initiated block moves or creations
  // when undo is enabled, the task is not editable, and the block has an ID.
  TRACKED_ACTIONS.includes(action) &&
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
  if (!shouldRecordStudentAction(action, event, canEditTask)) {
    return;
  }

  switch (action) {
    case StudentAction.Delete: {
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

    case StudentAction.Create:
    case StudentAction.Move: {
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

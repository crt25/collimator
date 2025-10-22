import { StudentActionType } from "../../types/scratch-student-activities";
import { StudentActivityHandlerParams } from "../../types/scratch-student-activities";
import { mapDeletedBlock } from "./scratch-block";
import { trackCreateActivity, trackDeleteActivity, trackMoveActivity } from ".";

const scratchToStudentActionType: Record<string, StudentActionType> = {
  create: StudentActionType.Create,
  move: StudentActionType.Move,
  delete: StudentActionType.Delete,
};

export const mapScratchEventTypeToStudentActionType = (
  type: string,
): StudentActionType | null => scratchToStudentActionType[type] || null;

export const handleStudentActivityTracking = ({
  event,
  action,
  canEditTask,
  sendRequest,
  solution,
  block,
}: StudentActivityHandlerParams): void => {
  switch (action) {
    case StudentActionType.Delete: {
      if (!event.oldXml) {
        console.error("Could not find xml in event", event);
        return;
      }

      const block = mapDeletedBlock(event.oldXml);

      if (!block) {
        console.error("Could not retrieve deleted block");
        return;
      }

      trackDeleteActivity({
        block,
        sendRequest,
        solution,
        event,
        canEditTask,
      });

      break;
    }

    case StudentActionType.Create: {
      if (!block) {
        return;
      }

      trackCreateActivity({
        block,
        sendRequest,
        solution,
        event,
        canEditTask,
      });

      break;
    }

    case StudentActionType.Move: {
      if (!block) {
        return;
      }

      trackMoveActivity({
        block,
        sendRequest,
        solution,
        event,
        canEditTask,
      });

      break;
    }

    default:
      throw new Error(`Unhandled student action type: ${action}`);
  }
};

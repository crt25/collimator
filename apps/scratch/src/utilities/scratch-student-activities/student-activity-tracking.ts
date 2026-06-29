import { StudentActionType } from "../../types/scratch-student-activities";
import { StudentActivityHandlerParams } from "../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../types/scratch-workspace";
import { mapDeletedBlock } from "./scratch-block";
import { logModule } from "./log-module";
import {
  trackChangeActivity,
  trackCreateActivity,
  trackDeleteActivity,
  // trackIntermediateChangeActivity,
  trackMoveActivity,
} from ".";

const scratchToStudentActionType: Record<string, StudentActionType> = {
  create: StudentActionType.Create,
  move: StudentActionType.Move,
  delete: StudentActionType.Delete,
  /**
   * Note:
   *
   * In the current scratch version (scratch-editor 11.6.0-react-18, see
   * src/scratch-editor/package.json), 'change' is emitted per keystroke while
   * editing a field, not just on commit. So it already covers the keystroke
   * sequence, which is why intermediate tracking is left off.
   *
   * A newer Scratch version adds 'block_field_intermediate_change' for
   * the per-keystroke edits and makes `change` commit-only. Once we upgrade,
   * uncomment it.
   */
  change: StudentActionType.BlockChange,
  // block_field_intermediate_change: StudentActionType.IntermediateFieldChange,
};

export const mapScratchEventTypeToStudentActionType = (
  type: string,
): StudentActionType | null => scratchToStudentActionType[type] || null;

export const isFieldChangeEvent = (event: WorkspaceChangeEvent): boolean =>
  event.type === "change" && event.element === "field";

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
        console.error(`${logModule} Could not find xml in event`, event);
        return;
      }

      const block = mapDeletedBlock(event.oldXml);

      if (!block) {
        console.error(`${logModule} Could not retrieve deleted block`);
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

    case StudentActionType.BlockChange: {
      if (!block) {
        return;
      }

      trackChangeActivity({
        block,
        sendRequest,
        solution,
        event,
        canEditTask,
      });

      break;
    }

    // case StudentActionType.IntermediateFieldChange: {
    //   if (!block) {
    //     return;
    //   }

    //   trackIntermediateChangeActivity({
    //     block,
    //     sendRequest,
    //     solution,
    //     event,
    //     canEditTask,
    //   });

    //   break;
    // }

    default:
      throw new Error(`Unhandled student action type: ${action}`);
  }
};

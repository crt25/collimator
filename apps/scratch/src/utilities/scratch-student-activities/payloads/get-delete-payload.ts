import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { DeletedBlockRecord } from "../../scratch-block";
import type { StudentDeleteActivity } from "../../../types/scratch-student-activities";

export const getDeletePayload = (
  block: DeletedBlockRecord,
  event: WorkspaceChangeEvent,
): StudentDeleteActivity | null => {
  if (!block || !event.blockId) return null;

  return {
    blockId: block.id,
    blockType: block.type,
    blockIdArray: block.blockIdArray,
    sizeOfDeletion: block.blockIdArray.length,
  };
};

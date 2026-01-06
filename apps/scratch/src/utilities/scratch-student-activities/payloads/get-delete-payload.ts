import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { DeletedBlockRecord } from "../../../types/scratch-student-activities/delete/types";
import { hasValidBlockContext } from "../scratch-block";
import { MissingAttributeError } from "../../../exceptions";
import type { StudentDeleteActivity } from "../../../types/scratch-student-activities";

export const getDeletePayload = (
  block: DeletedBlockRecord,
  event: WorkspaceChangeEvent,
): StudentDeleteActivity | null => {
  if (!hasValidBlockContext(event)) {
    // If there's no block ID in the event, we cannot create a valid payload
    // This should not happen in normal circumstances
    throw new MissingAttributeError(event, "blockId");
  }

  return {
    blockId: block.id,
    blockType: block.type,
    deletedBlocks: block.deletedBlocks,
  };
};

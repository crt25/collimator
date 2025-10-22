import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { hasValidBlockContext } from "../scratch-block";
import type { Block } from "scratch-blocks";
import type { StudentMoveActivity } from "../../../types/scratch-student-activities";

export const getMovePayload = (
  block: Block,
  event: WorkspaceChangeEvent,
): StudentMoveActivity | null => {
  if (!hasValidBlockContext(event)) {
    // If there's no block ID in the event, we cannot create a valid payload
    // This should not happen in normal circumstances
    console.error("Event blockId is missing");
    return null;
  }

  const oldParent = event.oldParentId;
  const newParent = block.getParent();

  return {
    blockId: event.blockId,
    blockType: block.type,
    oldParentId: oldParent ?? null,
    newParentId: newParent?.id ?? null,
  };
};

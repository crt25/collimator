import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import type { Block } from "scratch-blocks";
import type { StudentMoveActivity } from "../../../types/scratch-student-activities";

export const getMovePayload = (
  block: Block,
  event: WorkspaceChangeEvent,
): StudentMoveActivity | null => {
  if (!event.blockId) {
    return null;
  }

  const oldParent = event.oldParentId;
  const newParent = block.getParent();

  return {
    blockId: event.blockId,
    blockType: block.type,
    oldParentId: oldParent || null,
    newParentId: newParent ? newParent.id : null,
  };
};

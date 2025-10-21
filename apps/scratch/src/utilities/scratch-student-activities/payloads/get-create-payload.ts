import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import type { Block } from "scratch-blocks";
import type { StudentCreateActivity } from "../../../types/scratch-student-activities";

export const getCreatePayload = (
  block: Block,
  event: WorkspaceChangeEvent,
): StudentCreateActivity | null => {
  if (!event.blockId) {
    return null;
  }

  const parent = block.getParent?.();

  return {
    blockId: event.blockId,
    blockType: block.type,
    parentId: parent ? parent.id : null,
  };
};

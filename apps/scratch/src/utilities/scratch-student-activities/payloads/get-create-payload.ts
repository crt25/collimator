import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { hasValidBlockContext } from "../../scratch-block";
import type { Block } from "scratch-blocks";
import type { StudentCreateActivity } from "../../../types/scratch-student-activities";

export const getCreatePayload = (
  block: Block,
  event: WorkspaceChangeEvent,
): StudentCreateActivity | null => {
  if (!hasValidBlockContext(event)) {
    // If there's no block ID in the event, we cannot create a valid payload
    // This should not happen in normal circumstances
    throw new Error("Event blockId is missing");
  }

  const parent = block.getParent();

  return {
    blockId: event.blockId,
    blockType: block.type,
    parentId: parent?.id || null,
  };
};

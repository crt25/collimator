import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { hasValidBlockContext } from "../scratch-block";
import { MissingAttributeError } from "../../../exceptions";
import type { Block } from "scratch-blocks";
import type { StudentBlockChangeActivity } from "../../../types/scratch-student-activities";

export const getChangePayload = (
  block: Block,
  event: WorkspaceChangeEvent,
): StudentBlockChangeActivity => {
  if (!hasValidBlockContext(event)) {
    throw new MissingAttributeError(event, "blockId");
  }

  return {
    blockId: event.blockId,
    blockType: block.type,
    group: event.group ?? null,
    element: event.element ?? null,
    name: event.name ?? null,
    oldValue: event.oldValue,
    newValue: event.newValue,
  };
};

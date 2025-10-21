import { DeletedBlockRecord } from "../../../types/scratch-student-activities/delete";
import { DeletedBlockInfo } from "../../../types/scratch-student-activities/delete/types";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import type { Block } from "scratch-blocks";

const minStackSize = 2;

const getStackSize = (topBlock: Block): number => {
  let size = 0;
  let current: Block | null = topBlock;

  while (current) {
    size++;
    current = current.getNextBlock();
  }
  return size;
};

export const isBlockPartOfLargeStack = (block: Block): boolean => {
  if (!block) {
    return false;
  }

  let current: Block | null = block;

  while (current?.getParent()) {
    current = current.getParent();
  }

  if (!current) {
    return false;
  }

  const size = getStackSize(current);
  return size >= minStackSize;
};

export const wasPartOfLargeStack = (event: WorkspaceChangeEvent): boolean => {
  return event.oldParentId != null;
};

export const mapDeletedBlock = (
  xmlElement: Element,
): DeletedBlockRecord | null => {
  // Extract the block ID and type from the XML element
  const blockId = xmlElement.getAttribute("id");
  const blockType = xmlElement.getAttribute("type");

  if (!blockId || !blockType) {
    return null;
  }

  const blocks = xmlElement.querySelectorAll("block[id][type]");

  // Find all child blocks within the XML element
  const blockIdArray: DeletedBlockInfo = Array.from(blocks).flatMap(
    (blockElement) => {
      const id = blockElement.getAttribute("id");
      const type = blockElement.getAttribute("type");
      if (!id || !type) {
        return [];
      }
      return [{ id, type }];
    },
  );

  return {
    id: blockId,
    type: blockType,
    deletedBlocks: blockIdArray,
  };
};

export const hasValidBlockContext = (
  event: WorkspaceChangeEvent,
): event is WorkspaceChangeEvent & { blockId: string } => !!event.blockId;

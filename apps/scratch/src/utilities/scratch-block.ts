import { WorkspaceChangeEvent } from "../types/scratch-workspace";
import type { Block } from "scratch-blocks";

const minStackSize = 2;

export type DeletedBlockInfo = Array<{ id: string; type: string }>;
export interface DeletedBlockRecord {
  id: string;
  type: string;
  blockIdArray: DeletedBlockInfo;
}

function getStackSize(topBlock: Block): number {
  let size = 0;
  let current: Block | null = topBlock;

  while (current) {
    size++;
    current = current.getNextBlock?.() ?? null;
  }
  return size;
}

export function isBlockPartOfLargeStack(block: Block): boolean {
  if (!block) {
    return false;
  }

  let current: Block | null = block;

  while (current?.getParent?.()) {
    current = current.getParent?.() ?? null;
  }
  if (!current) {
    return false;
  }

  const size = getStackSize(current);
  return size >= minStackSize;
}

export const wasPartOfLargeStack = (event: WorkspaceChangeEvent): boolean => {
  return event.oldParentId !== null;
};

export const mapXmlBlockToBlock = (xmlElement: Element): DeletedBlockRecord => {
  const blockId = xmlElement.getAttribute("id");
  const blockType = xmlElement.getAttribute("type");
  if (!blockId || !blockType) {
    throw new Error(
      "Blockly XML element must have both 'id' and 'type' attributes",
    );
  }
  const blocks = xmlElement.querySelectorAll("block[id][type]");
  const blockIdArray = Array.from(blocks)
    .map((blockElement) => {
      const id = blockElement.getAttribute("id");
      const type = blockElement.getAttribute("type");
      if (!id || !type) return null;
      return { id, type };
    })
    .filter((block): block is DeletedBlockInfo[number] => block !== null);

  return {
    id: blockId,
    type: blockType,
    blockIdArray,
  };
};

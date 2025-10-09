import { StudentAction } from "../types/scratch-student-action";
import { WorkspaceChangeEvent } from "../types/scratch-workspace";
import {
  StudentCreateActivity,
  StudentMoveActivity,
  StudentDeleteActivity,
} from "../types/scratch-student-activities/index";
import type { Block, LiteBlock } from "scratch-blocks";

const minStackSize = 2;

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

export type StudentActionDataMap = {
  [StudentAction.Create]: (
    block: Block,
    event: WorkspaceChangeEvent,
  ) => StudentCreateActivity;
  [StudentAction.Move]: (
    block: Block,
    event: WorkspaceChangeEvent,
  ) => StudentMoveActivity;
  [StudentAction.Delete]: (
    block: Block,
    event: WorkspaceChangeEvent,
    blockIdArray: LiteBlock[],
  ) => StudentDeleteActivity;
};

const getBaseBlockData = (
  block: Block,
): { blockId: string; blockType: string } => ({
  blockId: block.id,
  blockType: block.type,
});

const blockDataBuilders: StudentActionDataMap = {
  [StudentAction.Move]: (block: Block, event: WorkspaceChangeEvent) => ({
    ...getBaseBlockData(block),
    oldParentId: event.oldParentId,
    newParentId: event.newParentId,
  }),
  [StudentAction.Create]: (block: Block, event: WorkspaceChangeEvent) => ({
    ...getBaseBlockData(block),
    parentId: event.newParentId ?? event.oldParentId ?? null,
  }),
  [StudentAction.Delete]: (
    block: Block,
    event: WorkspaceChangeEvent,
    blockIdArray: LiteBlock[],
  ) => ({
    ...getBaseBlockData(block),
    blockIdArray,
    sizeOfDeletion: blockIdArray.length ?? 1,
  }),
};

export const getBlockDataByAction = (
  action: StudentAction,
  block: Block,
  event: WorkspaceChangeEvent,
): StudentCreateActivity | StudentMoveActivity | StudentDeleteActivity => {
  if (action === StudentAction.Delete) {
    return blockDataBuilders[action](block, event, block.blockIdArray ?? []);
  }

  return blockDataBuilders[action](block, event);
};

export const mapXmlBlockToBlock = (xmlElement: Element): Block => {
  const blockId = xmlElement.getAttribute("id") || "";
  const blockType = xmlElement.getAttribute("type") || "";
  const innerHtml = xmlElement.innerHTML;

  // Extract all child block IDs and types using regex
  // This assumes that child blocks are represented as <block id="..." type="..."> in the XML
  const ids = [...innerHtml.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
  const childrenTypes = [...innerHtml.matchAll(/type="([^"]+)"/g)].map(
    (match) => match[1],
  );

  const blockIdArray = ids.map((id, index) => ({
    id,
    type: childrenTypes[index] || "unknown",
  }));

  return {
    id: blockId,
    type: blockType,
    blockIdArray,
  } as Block;
};

export const isBlock = (obj: Block | Element): obj is Block => {
  return obj && typeof obj === "object" && "id" in obj && "type" in obj;
};

export type ActivityData = {
  [K in keyof StudentActionDataMap]: ReturnType<StudentActionDataMap[K]>;
};

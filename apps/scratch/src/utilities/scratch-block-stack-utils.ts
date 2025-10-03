import type { Block } from "scratch-blocks";

const minStackSize = 2;

function getStackSize(topBlock: Block): number {
  let size = 0;
  let current: Block | null = topBlock;

  while (current) {
    size++;
    current = current.getNextBlock ? current.getNextBlock() : null;
  }
  return size;
}

export function isBlockPartOfLargeStack(block: Block): boolean {
  if (!block) {
    return false;
  }

  let current: Block | null = block;

  while (current && current.getParent && current.getParent()) {
    current = current.getParent();
  }
  if (!current) {
    return false;
  }

  const size = getStackSize(current);
  return size >= minStackSize;
}

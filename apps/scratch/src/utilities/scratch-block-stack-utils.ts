import type { Block } from "scratch-blocks";

export function getStackSize(topBlock: Block): number {
  let size = 0;
  let current: Block | null = topBlock;

  while (current) {
    size++;
    if (current && current.getNextBlock) {
      current = current.getNextBlock();
    } else {
      current = null;
    }
  }

  return size;
}

export function isBlockPartOfLargeStack(block: Block, minSize = 2): boolean {
  let current: Block | null = block;
  while (current && current.getParent && current.getParent()) {
    current = current.getParent();
  }
  if (!current) {
    return false;
  }
  const stacksize = getStackSize(current);
  return stacksize >= minSize;
}

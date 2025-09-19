import type { Block } from "scratch-blocks";

export function isBlockPartOfLargeStack(block: Block, minSize = 2): boolean {
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

  // Need to go top down to count the exact stack size
  let size = 0;
  let next: Block | null = current;
  while (next) {
    size++;
    next = next.getNextBlock ? next.getNextBlock() : null;
  }

  return size >= minSize;
}

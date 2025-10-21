import { isBlockPartOfLargeStack } from "../scratch-block";
import type { Block } from "scratch-blocks";

export const shouldTrackMoveBlock = (block: Block): boolean =>
  // Move only tracks blocks in large stacks
  isBlockPartOfLargeStack(block);

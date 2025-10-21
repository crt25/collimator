import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import {
  isBlockPartOfLargeStack,
  wasPartOfLargeStack,
} from "../../scratch-block";
import type { Block } from "scratch-blocks";

export const shouldTrackMoveBlock = (
  block: Block,
  event: WorkspaceChangeEvent,
): boolean => {
  // Move only tracks blocks in large stacks or blocks that were part of large stacks
  return isBlockPartOfLargeStack(block) || wasPartOfLargeStack(event);
};

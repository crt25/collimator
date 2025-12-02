import { StudentActionType } from "../../../types/scratch-student-activities";
import { WorkspaceChangeEvent } from "../../../types/scratch-workspace";
import { isBlockPartOfLargeStack, wasPartOfLargeStack } from "../scratch-block";
import { isTrackableStudentAction } from "./helpers";
import type { Block } from "scratch-blocks";

export const shouldTrackMoveBlock = (
  block: Block,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean => {
  if (!isTrackableStudentAction(StudentActionType.Move, event, canEditTask)) {
    return false;
  }

  // Move/Remove only tracks blocks in large stacks
  return isBlockPartOfLargeStack(block) || wasPartOfLargeStack(event);
};

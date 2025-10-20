import { StudentAction } from "../types/scratch-student-activities";
import { StudentActivityHandlerParams } from "../types/scratch-student-activities";
import { processStudentActivityPipeline } from "./scratch-student-activities/pipeline";
import { mapXmlBlockToBlock } from "./scratch-block";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";

const scratchToStudentAction: Record<string, StudentAction | null> = {
  create: StudentAction.Create,
  move: StudentAction.Move,
  delete: StudentAction.Delete,
};

export const mapScratchEventTypeToStudentAction = (
  type: string,
): StudentAction | null => scratchToStudentAction[type] || null;

export const shouldRecordStudentAction = (
  action: StudentAction,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined =>
  // This condition ensures that we only track user-initiated block moves or creations
  // when undo is enabled, the task is not editable, and the block has an ID.
  [StudentAction.Create, StudentAction.Move, StudentAction.Delete].includes(
    action,
  ) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

const shouldRecordBlockActivity = (
  block: Block | Element | null | undefined,
  action: StudentAction,
): boolean => {
  if (!block) {
    return false;
  }

  if (isBlock(block)) {
    if (action === StudentAction.Move && block) {
      // For Move actions, we only track if the block is part of a large stack
      return isBlockPartOfLargeStack(block);
    }
  }
  // For Create and Delete actions, we track all blocks
  return true;
};

export const trackStudentActivity = ({
  block,
  sendRequest,
  action,
  solution,
  event,
}: TrackMoveParams): void => {
  if (!shouldRecordBlockActivity(block, action)) {
    return;
  }

  const data = getBlockDataByAction(action, block, event);

  sendStudentActivity(data, { sendRequest, action, solution });
};

async function sendStudentActivity(
  data: ActivityData[keyof StudentActionDataMap],
  { sendRequest, action, solution }: StudentActivityRequest,
): Promise<void> {
  try {
    await sendRequest("postStudentActivity", {
      action,
      data,
      solution,
      type: "SCRATCH",
    });
  } catch (error) {
    console.error("Error sending student activity:", error);
  }
}

import { CrtContextValue } from "../contexts/CrtContext";
import { isBlockPartOfLargeStack } from "./scratch-block-stack-utils";
import type { Block } from "scratch-blocks";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";
interface TrackMoveParams {
  block: Block;
  sendRequest: CrtContextValue["sendRequest"];
  action: StudentAction;
  solution: Blob;
}

export enum StudentAction {
  Create = "create",
  Move = "move",
  Delete = "delete",
}

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
  (action === StudentAction.Move || action === StudentAction.Create) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

const shouldTrackMove = (block: Block | null | undefined): boolean => {
  if (!block) {
    return false;
  }

  return isBlockPartOfLargeStack(block);
};

const getBlockData = (block: Block): Record<string, unknown> => ({
  blockId: block.id ?? "",
  parentId: block.getParent?.()?.id ?? null,
  position: block.getRelativeToSurfaceXY?.() ?? { x: 0, y: 0 },
  childrenIds: block.getChildren?.().map((child) => child.id) ?? [],
});

export const trackStudentActivity = ({
  block,
  sendRequest,
  action,
  solution,
}: TrackMoveParams): void => {
  if (!shouldTrackMove(block)) {
    return;
  }

  const data = getBlockData(block);
  sendStudentActivity(data, { block, sendRequest, action, solution });
};

async function sendStudentActivity(
  data: Record<string, unknown>,
  { sendRequest, action, solution }: TrackMoveParams,
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

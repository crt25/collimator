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
  CREATE = "create",
  MOVE = "move",
  DELETE = "delete",
}

const scratchToStudentAction: Record<string, StudentAction | null> = {
  create: StudentAction.CREATE,
  move: StudentAction.MOVE,
  delete: StudentAction.DELETE,
};

export const mapScratchEventTypeToStudentAction = (
  type: string,
): StudentAction | null => scratchToStudentAction[type] || null;

export const shouldTrackActivity = (
  action: StudentAction,
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined =>
  (action === StudentAction.MOVE || action === StudentAction.CREATE) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

const shouldTrackMove = (block: Block | null | undefined): boolean =>
  !block ? false : isBlockPartOfLargeStack(block);

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

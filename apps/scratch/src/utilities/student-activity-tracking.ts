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
  REMOVE = "remove",
  DELETE = "delete",
}

export function resolveStudentActionFromEvent(
  event: WorkspaceChangeEvent,
  baseAction: StudentAction,
): StudentAction | undefined {
  const oldParentId = event.oldParentId ?? null;
  const newParentId = event.newParentId ?? null;

  if (oldParentId && oldParentId !== newParentId) {
    return StudentAction.REMOVE;
  }

  return baseAction ?? undefined;
}

const scratchToStudentAction: Record<string, StudentAction | null> = {
  create: StudentAction.CREATE,
  move: StudentAction.MOVE,
  remove: StudentAction.REMOVE,
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
  (action === StudentAction.MOVE ||
    action === StudentAction.CREATE ||
    action === StudentAction.REMOVE ||
    action === StudentAction.DELETE) &&
  event.recordUndo &&
  !canEditTask &&
  !!event.blockId;

const shouldTrackMove = (
  block: Block | null | undefined,
  action: StudentAction,
): boolean => {
  if (!block) {
    return false;
  }

  // Always track removal actions
  if (action === StudentAction.REMOVE) {
    return true;
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
  if (!shouldTrackMove(block, action)) {
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

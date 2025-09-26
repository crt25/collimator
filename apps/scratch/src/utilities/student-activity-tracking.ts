import { CrtContextValue } from "../contexts/CrtContext";
import { isBlockPartOfLargeStack } from "./scratch-block-stack-utils";
import type { Block, Workspace } from "scratch-blocks";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";
interface TrackMoveParams {
  workspace: Workspace;
  blockId?: string;
  sendRequest?: CrtContextValue["sendRequest"];
  action?: StudentActivityType;
}

export type StudentActivityType = "create" | "move" | "remove";
export function resolveActivityAction(
  event: WorkspaceChangeEvent,
): StudentActivityType | undefined {
  const oldParentId = event.oldParentId ?? null;
  const newParentId = event.newParentId ?? null;

  if (oldParentId && oldParentId !== newParentId) {
    return "remove";
  }

  if (event.type === "create" || event.type === "move") {
    return event.type;
  }

  return undefined;
}

export function shouldTrackActivity(
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined {
  return (
    !canEditTask &&
    !!event.blockId &&
    event.recordUndo &&
    !!resolveActivityAction(event)
  );
}

function shouldTrackMove(block: Block | null | undefined): boolean {
  if (!block) {
    return false;
  }
  return isBlockPartOfLargeStack(block);
}

export const trackStudentActivity = ({
  workspace,
  blockId,
  sendRequest,
  action,
}: TrackMoveParams): void => {
  if (!blockId || !action) {
    return;
  }

  const block = workspace.getBlockById(blockId);

  if (!block) {
    return;
  }

  if (action !== "remove" && !shouldTrackMove(block)) {
    return;
  }

  try {
    sendRequest?.("postStudentActivity", {
      action,
      blockId,
    });
  } catch (error) {
    console.error("Error sending student activity:", error);
  }
};

import { CrtContextValue } from "../contexts/CrtContext";
import { isBlockPartOfLargeStack } from "./scratch-block-stack-utils";
import type { Block, Workspace } from "scratch-blocks";
import type { WorkspaceChangeEvent } from "../types/scratch-workspace";
interface TrackMoveParams {
  workspace: Workspace;
  blockId?: string;
  sendRequest?: CrtContextValue["sendRequest"];
  action?: StudentAction;
}

export type StudentAction = "create" | "move";

export function shouldTrackActivity(
  event: WorkspaceChangeEvent,
  canEditTask: boolean | undefined,
): boolean | undefined {
  return (
    (event.type === "move" || event.type === "create") &&
    event.recordUndo &&
    !canEditTask &&
    !!event.blockId
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

  if (!shouldTrackMove(block)) {
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

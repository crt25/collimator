import { CrtContextValue } from "../contexts/CrtContext";
import { isBlockPartOfLargeStack } from "./scratch-block-stack-utils";
import type { Block, Workspace } from "scratch-blocks";

interface TrackMoveParams {
  workspace: Workspace;
  blockId: string;
  sendRequest?: CrtContextValue["sendRequest"];
  action: "move" | "create";
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

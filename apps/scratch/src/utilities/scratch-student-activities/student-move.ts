import {
  StudentActionType,
  StudentActionContext,
} from "../../types/scratch-student-activities";
import { shouldTrackMoveBlock } from "./filters";
import { getMovePayload } from "./payloads";
import { sendMoveActivity } from "./senders";

export const trackMoveActivity = ({
  block,
  sendRequest,
  solution,
  event,
}: StudentActionContext): void => {
  // Specific filtering to determine if the move action should be recorded
  if (!shouldTrackMoveBlock(block)) {
    return;
  }

  const data = getMovePayload(block, event);

  if (!data) {
    return;
  }

  sendMoveActivity(data, {
    sendRequest,
    action: StudentActionType.Move,
    solution,
  });
};

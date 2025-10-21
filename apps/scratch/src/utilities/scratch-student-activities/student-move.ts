import {
  StudentActionType,
  StudentActionContext,
} from "../../types/scratch-student-activities";
import { shouldTrackMoveBlock } from "./filters/should-track-move";
import { getMovePayload } from "./payloads";
import { sendMoveActivity } from "./senders/send-move-activity";

export const trackMoveActivity = ({
  block,
  sendRequest,
  solution,
  event,
  canEditTask,
}: StudentActionContext): void => {
  // Specific filtering to determine if the move action should be recorded
  if (!shouldTrackMoveBlock(block, event, canEditTask)) {
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

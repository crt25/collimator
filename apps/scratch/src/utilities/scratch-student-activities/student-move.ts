import { BaseStudentAction } from "../../types/scratch-student-activities";
import { StudentAction } from "../../types/scratch-student-activities/common";
import { shouldTrackMoveBlock } from "./filters";
import { getMovePayload } from "./payloads";
import { sendMoveActivity } from "./senders";

export const trackMoveActivity = ({
  block,
  sendRequest,
  solution,
  event,
}: BaseStudentAction): void => {
  // Specific filtering to determine if the move action should be recorded
  if (!shouldTrackMoveBlock(block, event)) {
    return;
  }

  const data = getMovePayload(block, event);

  if (!data) {
    return;
  }

  sendMoveActivity(data, { sendRequest, action: StudentAction.Move, solution });
};

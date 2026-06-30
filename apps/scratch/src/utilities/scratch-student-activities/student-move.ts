import { StudentActionContext } from "../../types/scratch-student-activities";
import { shouldTrackMoveBlock } from "./filters/should-track-move";
import { getMovePayload } from "./payloads";
import { sendMoveActivity } from "./senders/send-move-activity";
import { logBaseModule } from "./log-module";

const logModule = `${logBaseModule}[student-move]`;

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
    console.error(
      `${logModule} Could not create payload for moved block`,
      block,
      event,
    );
    return;
  }

  sendMoveActivity(data, sendRequest, solution);
};

import { StudentActionContext } from "../../types/scratch-student-activities";
import { shouldTrackIntermediateChange } from "./filters/should-track-intermediate-change";
import { getIntermediateChangePayload } from "./payloads";
import { sendIntermediateChangeActivity } from "./senders/send-intermediate-change-activity";

export const trackIntermediateChangeActivity = ({
  block,
  sendRequest,
  solution,
  event,
  canEditTask,
}: StudentActionContext): void => {
  if (!shouldTrackIntermediateChange(event, canEditTask)) {
    return;
  }

  const data = getIntermediateChangePayload(block, event);

  if (!data) {
    console.error(
      "Could not create payload for intermediate-changed block",
      block,
      event,
    );
    return;
  }

  sendIntermediateChangeActivity(data, sendRequest, solution);
};

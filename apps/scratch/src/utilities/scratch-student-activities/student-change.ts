import { StudentActionContext } from "../../types/scratch-student-activities";
import { shouldTrackChange } from "./filters/should-track-change";
import { getChangePayload } from "./payloads";
import { sendChangeActivity } from "./senders/send-change-activity";

export const trackChangeActivity = ({
  block,
  sendRequest,
  solution,
  event,
  canEditTask,
}: StudentActionContext): void => {
  if (!shouldTrackChange(event, canEditTask)) {
    return;
  }

  const data = getChangePayload(block, event);

  sendChangeActivity(data, sendRequest, solution);
};

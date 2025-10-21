import {
  StudentActionType,
  StudentActionContext,
} from "../../types/scratch-student-activities";
import { shouldTrackCreateBlock } from "./filters/should-track-create";
import { getCreatePayload } from "./payloads";
import { sendCreateActivity } from "./senders/send-create-activity";

export const trackCreateActivity = ({
  block,
  sendRequest,
  solution,
  event,
  canEditTask,
}: StudentActionContext): void => {
  if (!shouldTrackCreateBlock(event, canEditTask)) {
    return;
  }

  const data = getCreatePayload(block, event);

  if (!data) {
    return;
  }

  sendCreateActivity(data, {
    sendRequest,
    action: StudentActionType.Create,
    solution,
  });
};

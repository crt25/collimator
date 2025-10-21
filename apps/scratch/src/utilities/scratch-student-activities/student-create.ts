import {
  StudentActionType,
  StudentActionContext,
} from "../../types/scratch-student-activities";
import { shouldTrackCreateBlock } from "./filters";
import { getCreatePayload } from "./payloads";
import { sendCreateActivity } from "./senders";

export const trackCreateActivity = ({
  block,
  sendRequest,
  solution,
  event,
}: StudentActionContext): void => {
  if (!shouldTrackCreateBlock()) {
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

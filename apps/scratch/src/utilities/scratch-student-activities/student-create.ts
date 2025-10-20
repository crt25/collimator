import { BaseStudentAction } from "../../types/scratch-student-activities";
import { StudentAction } from "../../types/scratch-student-activities/common";
import { shouldTrackCreateBlock } from "./filters";
import { getCreatePayload } from "./payloads";
import { sendCreateActivity } from "./senders";

export const trackCreateActivity = ({
  block,
  sendRequest,
  solution,
  event,
}: BaseStudentAction): void => {
  if (!shouldTrackCreateBlock(block)) {
    return;
  }

  const data = getCreatePayload(block, event);

  if (!data) {
    return;
  }

  sendCreateActivity(data, {
    sendRequest,
    action: StudentAction.Create,
    solution,
  });
};

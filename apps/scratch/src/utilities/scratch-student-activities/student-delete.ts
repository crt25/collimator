import { DeleteStudentAction } from "../../types/scratch-student-activities";
import { StudentAction } from "../../types/scratch-student-activities/common";
import { shouldTrackDeleteBlock } from "./filters";
import { getDeletePayload } from "./payloads";
import { sendDeleteActivity } from "./senders";

export const trackDeleteActivity = ({
  block,
  sendRequest,
  solution,
  event,
}: DeleteStudentAction): void => {
  if (!shouldTrackDeleteBlock(block)) {
    return;
  }

  const data = getDeletePayload(block, event);

  if (!data) {
    return;
  }

  sendDeleteActivity(data, {
    sendRequest,
    action: StudentAction.Delete,
    solution,
  });
};

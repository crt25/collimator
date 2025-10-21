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
  // Specific filtering to determine if the delete action should be tracked
  if (!shouldTrackDeleteBlock()) {
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

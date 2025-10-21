import { DeleteStudentAction } from "../../types/scratch-student-activities";
import { shouldTrackDeleteBlock } from "./filters/should-track-delete";
import { getDeletePayload } from "./payloads";
import { sendDeleteActivity } from "./senders/send-delete-activity";

export const trackDeleteActivity = ({
  block,
  sendRequest,
  solution,
  event,
  canEditTask,
}: DeleteStudentAction): void => {
  // Specific filtering to determine if the delete action should be tracked
  if (!shouldTrackDeleteBlock(event, canEditTask)) {
    return;
  }

  const data = getDeletePayload(block, event);

  if (!data) {
    return;
  }

  sendDeleteActivity(data, sendRequest, solution);
};

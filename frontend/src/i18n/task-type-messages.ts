import { defineMessages, MessageDescriptor } from "react-intl";
import { TaskType } from "@/api/collimator/generated/models";

const TaskTypeMessages = defineMessages({
  [TaskType.SCRATCH]: {
    id: "UserRole.scratch",
    defaultMessage: "Scratch",
  },
});

export const getTaskTypeMessage = (status: TaskType): MessageDescriptor =>
  TaskTypeMessages[status];

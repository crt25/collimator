import { defineMessages, MessageDescriptor } from "react-intl";
import { ErrorCode } from "@/api/collimator/generated/models";

type ErrorMessages = {
  [K in (typeof ErrorCode)[keyof typeof ErrorCode]]: MessageDescriptor;
};

const errorMessages = defineMessages({
  TASK_IN_USE_BY_LESSON_OR_CLASS_WITH_STUDENTS: {
    id: "ApiError.TASK_IN_USE_BY_LESSON_OR_CLASS_WITH_STUDENTS",
    defaultMessage:
      "Cannot perform this action because the task is currently in use by one or more lessons or classes with students.",
  },
  TASK_IN_OTHER_USERS_LESSON: {
    id: "ApiError.TASK_IN_OTHER_USERS_LESSON",
    defaultMessage:
      "Cannot perform this action because the task is currently in use by one or more other users' lessons.",
  },
  GENERIC_ERROR: {
    id: "ApiError.GENERIC_ERROR",
    defaultMessage: "An unexpected error occurred. Please try again later.",
  },
}) satisfies ErrorMessages;

export function getErrorMessageDescriptor(
  errorCode?: string,
): MessageDescriptor {
  console.log("Getting error message for error code:", errorCode);
  if (errorCode && errorCode in errorMessages) {
    return errorMessages[errorCode as keyof typeof errorMessages];
  }

  return errorMessages.GENERIC_ERROR;
}

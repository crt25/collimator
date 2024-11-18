import { UserType } from "@/api/collimator/generated/models";
import { defineMessages, MessageDescriptor } from "react-intl";

const UserRoleMessages = defineMessages({
  [UserType.ADMIN]: {
    id: "UserRole.admin",
    defaultMessage: "Admin",
  },
  [UserType.TEACHER]: {
    id: "UserRole.teacher",
    defaultMessage: "Teacher",
  },
});

export const getUserTypeMessage = (status: UserType): MessageDescriptor =>
  UserRoleMessages[status];
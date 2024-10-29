import { defineMessages, MessageDescriptor } from "react-intl";

export enum UserRole {
  admin = "admin",
  teacher = "teacher",
  student = "student",
}

const UserRoleMessages = defineMessages({
  admin: {
    id: "UserRole.admin",
    defaultMessage: "Admin",
  },
  teacher: {
    id: "UserRole.teacher",
    defaultMessage: "Teacher",
  },
  student: {
    id: "UserRole.student",
    defaultMessage: "Student",
  },
});

export const getUserRoleMessage = (status: UserRole): MessageDescriptor =>
  UserRoleMessages[status];

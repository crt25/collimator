import { defineMessages, MessageDescriptor } from "react-intl";

export enum ClassStatus {
  current = "current",
  past = "past",
}

const ClassStatusMessages = defineMessages({
  current: {
    id: "ClassStatus.current",
    defaultMessage: "Current",
  },
  past: {
    id: "ClassStatus.past",
    defaultMessage: "Past",
  },
});

export const getClassStatusMessage = (status: ClassStatus): MessageDescriptor =>
  ClassStatusMessages[status];

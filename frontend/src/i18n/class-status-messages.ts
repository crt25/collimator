import { defineMessages, MessageDescriptor } from "react-intl";

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

export const getClassStatusMessage = (
  status: keyof typeof ClassStatusMessages,
): MessageDescriptor => ClassStatusMessages[status];

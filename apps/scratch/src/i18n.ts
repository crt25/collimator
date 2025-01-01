import { FormattedMessage } from "react-intl";
import formatMessageInternal from "format-message";

export const formatMessage = (
  message: FormattedMessage.MessageDescriptor,
): string => {
  if (!message.defaultMessage) {
    throw new Error("No default value was provided");
  }

  return formatMessageInternal({
    id: message.id,
    description: message.description,
    default: message.defaultMessage,
  });
};

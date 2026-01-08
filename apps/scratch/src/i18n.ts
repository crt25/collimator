import { MessageDescriptor } from "react-intl";
import formatMessageInternal from "format-message";

export const formatMessage = (message: MessageDescriptor): string => {
  if (!message.defaultMessage) {
    throw new Error("No default value was provided");
  }

  return formatMessageInternal({
    id: message.id,
    // @ts-expect-error The typing of formatMessageInternal is wrong
    description: message.description,
    // @ts-expect-error The typing of formatMessageInternal is wrong
    default: message.defaultMessage,
  });
};

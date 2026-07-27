import styled from "@emotion/styled";
import { useEffect } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { NetworkError } from "@/errors/api";

const logModule = "[ErrorMessage]";

const messages = defineMessages({
  networkError: {
    id: "ErrorMessage.networkError",
    defaultMessage:
      "The server could not be reached. Please check your internet connection and try again.",
  },
  genericError: {
    id: "ErrorMessage.genericError",
    defaultMessage:
      "An error occurred while loading this content. Please try again later.",
  },
});

const ErrorMessageWrapper = styled.div`
  color: var(--error-color);
`;

const ErrorMessage = ({ error }: { error: Error }) => {
  // The underlying message is technical and untranslated, so it is kept for
  // developers in the console rather than being shown to the user.
  useEffect(() => {
    console.error(`${logModule} ${error.name}: ${error.message}`, error);
  }, [error]);

  return (
    <ErrorMessageWrapper>
      <FormattedMessage
        {...(error instanceof NetworkError
          ? messages.networkError
          : messages.genericError)}
      />
    </ErrorMessageWrapper>
  );
};

export default ErrorMessage;

import styled from "@emotion/styled";

const ErrorMessageWrapper = styled.div`
  color: var(--error-color);
`;

const ValidationErrorMessage = ({ children }: { children?: string | null }) => {
  if (!children) {
    return null;
  }

  return <ErrorMessageWrapper>{children}</ErrorMessageWrapper>;
};

export default ValidationErrorMessage;

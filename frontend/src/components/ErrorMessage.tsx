import styled from "@emotion/styled";

const ErrorMessageWrapper = styled.div`
  color: var(--error-color);
`;

const ErrorMessage = ({ error }: { error: Error }) => {
  return <ErrorMessageWrapper>{error.message}</ErrorMessageWrapper>;
};

export default ErrorMessage;

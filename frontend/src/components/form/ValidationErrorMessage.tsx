import styled from "@emotion/styled";

const ErrorMessageWrapper = styled.div`
  color: var(--error-color);
`;

type ErrorMessage = string | null | undefined;

const ValidationErrorMessage = ({
  children,
}: {
  children?: ErrorMessage | ErrorMessage[];
}) => {
  if (!children) {
    return null;
  }

  if (Array.isArray(children)) {
    return (
      <ErrorMessageWrapper>
        {children
          .filter((c) => c !== null && c !== undefined)
          .map((child, index) => (
            <div key={index}>{child}</div>
          ))}
      </ErrorMessageWrapper>
    );
  }

  return <ErrorMessageWrapper>{children}</ErrorMessageWrapper>;
};

export default ValidationErrorMessage;

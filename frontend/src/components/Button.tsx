import styled from "@emotion/styled";

const Button = styled.button<{ negative?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);

  border: none;

  background-color: var(--button-background-color);
  color: var(--button-foreground-color);
`;

export default Button;

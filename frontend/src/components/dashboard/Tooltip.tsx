import styled from "@emotion/styled";

const Tooltip = styled.div<{ isShown: boolean }>`
  position: absolute;

  /* prevent the tooltip from stealing the hover */
  pointer-events: none;

  opacity: ${({ isShown }) => (isShown ? "1" : "0")};

  padding: 0.5rem 1rem;
  background-color: var(--background-color);
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);
`;

export default Tooltip;

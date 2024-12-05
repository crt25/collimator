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

  .data {
    & > div > span:first-of-type {
      padding-right: 0.25rem;

      &::after {
        content: ":";
      }
    }
  }
`;

export default Tooltip;

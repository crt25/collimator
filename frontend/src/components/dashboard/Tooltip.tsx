import styled from "@emotion/styled";

const Tooltip = styled.div<{ isShown: boolean }>`
  position: absolute;

  /* ensure the tooltip doesn't get overly squashed if at the screen edge */
  min-width: 12rem;

  opacity: ${({ isShown }) => (isShown ? "1" : "0")};

  padding: 0.5rem 1rem;
  background-color: var(--background-color);
  border: var(--foreground-color) 1px solid;
  border-radius: var(--border-radius);
  z-index: 9000;

  .data {
    & > div > span:first-of-type {
      padding-right: 0.25rem;

      &::after {
        content: ":";
      }
    }
  }

  .group {
    margin-top: 0.5rem;
  }
`;

export default Tooltip;

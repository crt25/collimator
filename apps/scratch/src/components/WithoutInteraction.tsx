import styled from "@emotion/styled";

export const WithoutInteraction = styled.div`
  pointer-events: none;
  user-select: none;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: rgba(255, 255, 255, 0.5);
  }
`;

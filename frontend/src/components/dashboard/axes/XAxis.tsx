import styled from "@emotion/styled";

const XAxis = styled.div`
  position: absolute;

  left: 0.5rem /* do not cross x-axis */;
  right: 0;

  bottom: 0;

  height: 0.5rem;
  box-sizing: border-box; /* make the height include the border */
  border-top: var(--foreground-color) 1px solid;

  &:before {
    position: absolute;
    right: -1px; /* cover the entire axis line */
    bottom: 0;

    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;

    /* generated using https://triangle.designyourcode.io/triangle for 1rem = 16px as height */
    border-width: 8px 0px 8px 13.9px;
    border-color: transparent transparent transparent var(--foreground-color);
  }
`;

export default XAxis;

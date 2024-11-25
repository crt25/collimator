import styled from "@emotion/styled";

const YAxis = styled.div`
  position: absolute;

  top: 0;
  bottom: 0.5rem /* do not cross x-axis */;

  left: 0;

  width: 0.5rem;
  box-sizing: border-box; /* make the height include the border */
  border-right: var(--foreground-color) 1px solid;

  &:before {
    position: absolute;
    top: -1px; /* cover the entire axis line */
    left: 0;

    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-style: solid;
    /* generated using https://triangle.designyourcode.io/triangle for 1rem = 16px as height */
    border-width: 0px 8px 13.9px 8px;
    border-color: transparent transparent var(--foreground-color) transparent;
  }
`;

export default YAxis;

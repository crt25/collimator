import styled from "@emotion/styled";
import { Row } from "react-bootstrap";

const FullHeightRow = styled(Row)`
  min-height: 0;

  & > * {
    height: 100%;

    display: flex;
    flex-direction: column;
  }
`;

export default FullHeightRow;

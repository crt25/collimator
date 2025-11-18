import { Container } from "@chakra-ui/react";
import styled from "@emotion/styled";

const RemainingHeightContainer = styled(Container)`
  flex-grow: 1;

  /* by default flex items cannot be smaller than their contents, override this, see https://stackoverflow.com/a/43809765/2897827 */
  min-height: 0;

  display: flex;
  flex-direction: column;
`;

export default RemainingHeightContainer;

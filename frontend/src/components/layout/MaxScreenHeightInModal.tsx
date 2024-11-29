import styled from "@emotion/styled";
import MaxScreenHeight from "./MaxScreenHeight";

const MaxScreenHeightInModal = styled(MaxScreenHeight)`
  height: calc(100vh - 2 * var(--bs-modal-margin));
  overflow-y: scroll;
`;

export default MaxScreenHeightInModal;

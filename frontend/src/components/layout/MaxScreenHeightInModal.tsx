import styled from "@emotion/styled";
import MaxScreenHeight from "./MaxScreenHeight";

const MaxScreenHeightInModal = styled(MaxScreenHeight)`
  height: calc(100vh - 2 * var(--bs-modal-margin));
`;

export default MaxScreenHeightInModal;

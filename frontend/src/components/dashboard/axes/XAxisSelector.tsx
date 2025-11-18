import styled from "@emotion/styled";

const XAxisSelector = styled.div`
  margin-top: 0.5rem;

  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: flex-end;

  & > * {
    flex-grow: 1;
  }
`;

export default XAxisSelector;

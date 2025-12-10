import styled from "@emotion/styled";

const YAxisSelector = styled.div`
  margin-bottom: 0.5rem;

  width: 100%;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  & > * {
    flex-grow: 1;
  }
`;

export default YAxisSelector;

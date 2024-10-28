import styled from "@emotion/styled";

const TaskList = styled.menu`
  height: 100%;
  list-style: none;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: scroll;

  padding-bottom: 1rem;
`;

export default TaskList;

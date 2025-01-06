import styled from "@emotion/styled";
import { faStar, faStarHalfStroke } from "@fortawesome/free-regular-svg-icons";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { TaskProgress } from "@/api/collimator/generated/models";

const TaskListItemWrapper = styled.button<{ active?: boolean }>`
  width: 100%;
  padding: 1rem 2rem;

  border: 1px solid var(--foreground-color);
  border-radius: var(--border-radius);

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  max-height: 4rem;

  background-color: var(--background-color);

  text-decoration: ${({ active }) => (active ? "underline" : "none")};

  &:hover * {
    text-decoration: underline;
  }
`;

const ChildWrapper = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  /* allows the item to take up less space than it's contents */
  min-width: 0;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  /* do not allows this item to shrink */
  flex-shrink: 0;

  width: 1.5rem;

  svg {
    height: auto;
    width: 100%;
  }
`;

const iconByTaskStatus = (
  status: TaskProgress,
): FontAwesomeIconProps["icon"] | null => {
  switch (status) {
    case TaskProgress.done:
      return faStar;
    case TaskProgress.partiallyDone:
      return faStarHalfStroke;
    case TaskProgress.opened:
      return faScrewdriverWrench;
    case TaskProgress.unOpened:
    default:
      return null;
  }
};

const TaskListItem = ({
  children,
  progress,
  active,
  onClick,
}: {
  children: React.ReactNode;
  progress: TaskProgress;
  active?: boolean;
  onClick?: () => void;
}) => {
  const icon = iconByTaskStatus(progress);

  return (
    <li>
      <TaskListItemWrapper onClick={onClick} active={active}>
        <ChildWrapper>{children}</ChildWrapper>
        <IconWrapper>{icon && <FontAwesomeIcon icon={icon} />}</IconWrapper>
      </TaskListItemWrapper>
    </li>
  );
};

export default TaskListItem;

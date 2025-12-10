import { faStar, faStarHalfStroke } from "@fortawesome/free-regular-svg-icons";
import { chakra, defineRecipe } from "@chakra-ui/react";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { TaskProgress } from "@/api/collimator/generated/models";

const taskListItemRecipe = defineRecipe({
  base: {
    width: "100%",
    padding: "{spacing.md} {spacing.xl}",
    border: "1px solid",
    borderColor: "fg",
    borderRadius: "sm",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "{spacing.md}",
    maxHeight: "4rem",
    backgroundColor: "bg",
    textDecoration: "none",
    _hover: {
      "& *": {
        textDecoration: "underline",
      },
    },
  },
  variants: {
    active: {
      true: {
        textDecoration: "underline",
      },
      false: {
        textDecoration: "none",
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

const TaskListItemWrapper = chakra("button", taskListItemRecipe);

const ChildWrapper = chakra("div", {
  base: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
    /** allows the item to take up less space than it's contents */
    minWidth: 0,
  },
});

const IconWrapper = chakra("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    /** do not allows this item to shrink */
    flexShrink: 0,
    width: "{spacing.lg}",
    "& svg": {
      height: "auto",
      width: "100%",
    },
  },
});

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

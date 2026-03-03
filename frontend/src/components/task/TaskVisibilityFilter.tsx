import { defineMessages, useIntl } from "react-intl";
import DropdownMenu from "../DropdownMenu";

export enum VisibilityFilterValue {
  All = "all",
  PublicOnly = "public",
  PrivateOnly = "private",
}

const messages = defineMessages({
  filterLabel: {
    id: "TaskVisibilityFilter.filterLabel",
    defaultMessage: "Filter by visibility",
  },
  allTasks: {
    id: "TaskVisibilityFilter.allTasks",
    defaultMessage: "All Tasks",
  },
  publicOnly: {
    id: "TaskVisibilityFilter.publicOnly",
    defaultMessage: "Public Only",
  },
  privateOnly: {
    id: "TaskVisibilityFilter.privateOnly",
    defaultMessage: "Private Only",
  },
});

type TaskVisibilityFilterProps = {
  value: VisibilityFilterValue;
  onChange: (value: VisibilityFilterValue) => void;
};

const filterLabels: Record<VisibilityFilterValue, keyof typeof messages> = {
  [VisibilityFilterValue.All]: "allTasks",
  [VisibilityFilterValue.PublicOnly]: "publicOnly",
  [VisibilityFilterValue.PrivateOnly]: "privateOnly",
};

export const TaskVisibilityFilter = ({
  value,
  onChange,
}: TaskVisibilityFilterProps) => {
  const intl = useIntl();

  const currentLabel = intl.formatMessage(messages[filterLabels[value]]);

  return (
    <DropdownMenu trigger={currentLabel} testId="task-visibility-filter">
      <DropdownMenu.Item
        onClick={() => onChange(VisibilityFilterValue.All)}
        testId="visibility-filter-all"
      >
        {intl.formatMessage(messages.allTasks)}
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => onChange(VisibilityFilterValue.PublicOnly)}
        testId="visibility-filter-public"
      >
        {intl.formatMessage(messages.publicOnly)}
      </DropdownMenu.Item>
      <DropdownMenu.Item
        onClick={() => onChange(VisibilityFilterValue.PrivateOnly)}
        testId="visibility-filter-private"
      >
        {intl.formatMessage(messages.privateOnly)}
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};

export default TaskVisibilityFilter;

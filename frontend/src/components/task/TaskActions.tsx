import { defineMessages, useIntl } from "react-intl";
import { LuTrash } from "react-icons/lu";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import DropdownMenu from "../DropdownMenu";
import { ButtonMessages } from "@/i18n/button-messages";

const messages = defineMessages({
  deleteTask: {
    id: "TaskActions.deleteTask",
    defaultMessage: "Delete Task",
  },
});

const TaskActions = ({ taskId }: { taskId: number }) => {
  const intl = useIntl();
  const deleteTask = useDeleteTask();

  return (
    <DropdownMenu
      trigger={intl.formatMessage(ButtonMessages.actions)}
      variant="emphasized"
    >
      <DropdownMenu.Item onClick={() => deleteTask(taskId)} icon={<LuTrash />}>
        {intl.formatMessage(messages.deleteTask)}
      </DropdownMenu.Item>
    </DropdownMenu>
  );
};

export default TaskActions;

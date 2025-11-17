import { defineMessages, useIntl } from "react-intl";
import { LuTrash } from "react-icons/lu";
import DropdownMenu from "../DropdownMenu";
import { ButtonMessages } from "@/i18n/button-messages";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";

const messages = defineMessages({
  deleteTask: {
    id: "TaskSessionActions.deleteTask",
    defaultMessage: "Delete Task",
  },
});

const TaskSessionActions = ({
  classId: _classId,
  sessionId: _sessionId,
  taskId,
}: {
  classId: number;
  sessionId: number;
  taskId: number;
}) => {
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

export default TaskSessionActions;

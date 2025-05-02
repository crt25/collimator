import { useCallback } from "react";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";

const messages = defineMessages({
  title: {
    id: "CreateTask.title",
    defaultMessage: "Create Task",
  },
  submit: {
    id: "CreateTask.submit",
    defaultMessage: "Create Task",
  },
});

const CreateTask = () => {
  const createTask = useCreateTask();

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      await createTask(taskSubmission);
    },
    [createTask],
  );

  return (
    <>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="CreateTask.header"
            defaultMessage="Create Task"
          />
        </PageHeader>
        <TaskForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
    </>
  );
};

export default CreateTask;

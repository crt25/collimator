import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import { useCallback } from "react";
import { useRouter } from "next/router";
import TaskForm, { TaskFormValues } from "@/components/task/TaskForm";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";

const messages = defineMessages({
  submit: {
    id: "CreateTask.submit",
    defaultMessage: "Create Task",
  },
});

const CreateTask = () => {
  const router = useRouter();
  const createTask = useCreateTask();

  const onSubmit = useCallback(
    async (formValues: TaskFormValues) => {
      await createTask({
        title: formValues.title,
        description: formValues.description,
        type: formValues.type,
        file: formValues.blob,
      });

      router.back();
    },
    [createTask, router],
  );

  return (
    <>
      <Header />
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

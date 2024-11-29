import { useTask, useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import {
  useUpdateTask,
  useUpdateTaskFile,
} from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import PageHeader from "@/components/PageHeader";
import TaskForm, { TaskFormValues } from "@/components/task/TaskForm";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  submit: {
    id: "EditTask.submit",
    defaultMessage: "Save Task",
  },
});

const EditTask = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId?: string;
  };

  const task = useTask(taskId);
  const taskFile = useTaskFile(taskId);
  const updateTask = useUpdateTask();
  const updateTaskFile = useUpdateTaskFile();

  const onSubmit = useCallback(
    async (formValues: TaskFormValues) => {
      if (task.data && taskFile.data) {
        if (formValues.blobChanged) {
          await updateTaskFile(task.data.id, formValues.blob);
        }

        await updateTask(task.data.id, {
          title: formValues.title,
          description: formValues.description,
          type: formValues.type,
        });

        router.back();
      }
    },
    [task.data, taskFile.data, updateTask, updateTaskFile, router],
  );

  return (
    <>
      <Header />
      <Container>
        <CrtNavigation task={task.data} />
        <PageHeader>
          <FormattedMessage id="EditTask.header" defaultMessage="Edit Task" />
        </PageHeader>
        <MultiSwrContent
          data={[task.data, taskFile.data]}
          isLoading={[task.isLoading, taskFile.isLoading]}
          errors={[task.error, taskFile.error]}
        >
          {([task, taskFile]) => (
            <TaskForm
              initialValues={{ ...task, blob: taskFile }}
              submitMessage={messages.submit}
              onSubmit={onSubmit}
            />
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default EditTask;

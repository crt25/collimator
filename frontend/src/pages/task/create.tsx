import { useCallback } from "react";
import { defineMessages } from "react-intl";
import { useRouter } from "next/router";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import CrtNavigation from "@/components/CrtNavigation";
import PageLayout from "@/components/layout/PageLayout";
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
  const router = useRouter();

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      if (!taskSubmission.taskFile) {
        return;
      }

      const createdTask = await createTask({
        ...taskSubmission,
        taskFile: taskSubmission.taskFile,
        referenceSolutions:
          taskSubmission.initialSolution !== null
            ? [taskSubmission.initialSolution]
            : [],
        referenceSolutionsFiles:
          taskSubmission.initialSolutionFile !== null
            ? [taskSubmission.initialSolutionFile]
            : [],
      });

      router.push(`/task/${createdTask.id}/detail`);
    },
    [createTask, router],
  );

  return (
    <PageLayout
      title={messages.title}
      heading={messages.title}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <TaskForm submitMessage={messages.submit} onSubmit={onSubmit} />
    </PageLayout>
  );
};

export default CreateTask;

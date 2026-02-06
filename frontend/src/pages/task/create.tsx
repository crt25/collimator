import { useCallback } from "react";
import { defineMessages } from "react-intl";
import { useRouter } from "next/router";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import CrtNavigation from "@/components/CrtNavigation";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import PageLayout from "@/components/layout/PageLayout";

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

  const returnUrlParam = router.query.returnUrl;
  const returnUrl =
    typeof returnUrlParam === "string"
      ? returnUrlParam
      : Array.isArray(returnUrlParam)
        ? returnUrlParam[0]
        : undefined;

  const isValidReturnUrl = (url: string): boolean =>
    url.startsWith("/") && !url.startsWith("//");

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      const createdTask = await createTask({
        ...taskSubmission,
        referenceSolutions:
          taskSubmission.initialSolution !== null
            ? [taskSubmission.initialSolution]
            : [],
        referenceSolutionsFiles:
          taskSubmission.initialSolutionFile !== null
            ? [taskSubmission.initialSolutionFile]
            : [],
      });

      // Redirect to returnUrl if provided and valid, otherwise to task detail page
      if (returnUrl && isValidReturnUrl(decodeURIComponent(returnUrl))) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        router.push(`/task/${createdTask.id}/detail`);
      }
    },
    [createTask, router, returnUrl],
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

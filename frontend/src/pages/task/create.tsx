import { useCallback } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useRouter } from "next/router";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

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
    <MaxScreenHeight>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage
            id="CreateTask.header"
            defaultMessage="Create Task"
          />
        </PageHeading>
        <TaskForm submitMessage={messages.submit} onSubmit={onSubmit} />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default CreateTask;

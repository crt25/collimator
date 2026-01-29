import { useCallback, useMemo } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/router";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import { TaskType } from "@/api/collimator/generated/models";
import { useDeleteTask } from "@/api/collimator/hooks/tasks/useDeleteTask";
import { toaster } from "@/components/Toaster";

const messages = defineMessages({
  title: {
    id: "CreateTask.title",
    defaultMessage: "Create Task",
  },
  submit: {
    id: "CreateTask.submit",
    defaultMessage: "Create Task",
  },
  cannotDeleteReplacedTask: {
    id: "CreateTask.cannotDeleteReplacedTask",
    defaultMessage:
      "There was an error deleting the existing task. Please delete it manually.",
  },
});

type CreateTaskQueryParams = {
  type: TaskType;
  title: string;
  description: string;
  replaceTaskId: string;
};

type InitialTaskDetails = Record<string, string | string[] | undefined>;

const isValidTaskType = (type: unknown): type is TaskType =>
  Object.values(TaskType).includes(type as TaskType);

const parseQueryParams = (
  query: InitialTaskDetails,
): Partial<CreateTaskQueryParams> => {
  const { type, title, description, replaceTaskId } = query;

  return {
    ...(isValidTaskType(type) && { type }),
    ...(typeof title === "string" && { title }),
    ...(typeof description === "string" && { description }),
    ...(typeof replaceTaskId === "string" && { replaceTaskId }),
  };
};

const CreateTask = () => {
  const createTask = useCreateTask();
  const router = useRouter();
  const intl = useIntl();
  const deleteTask = useDeleteTask();

  const queryParams = useMemo(
    () => parseQueryParams(router.query),
    [router.query],
  );

  const initialValues = useMemo(
    () => ({
      ...(queryParams.type && { type: queryParams.type }),
      ...(queryParams.title && { title: queryParams.title }),
      ...(queryParams.description && { description: queryParams.description }),
    }),
    [queryParams],
  );

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

      if (queryParams.replaceTaskId) {
        try {
          await deleteTask(parseInt(queryParams.replaceTaskId));
        } catch {
          toaster.error({
            title: intl.formatMessage(messages.cannotDeleteReplacedTask),
            closable: true,
          });
        }
      }

      router.push(`/task/${createdTask.id}/detail`);
    },
    [createTask, router, queryParams.replaceTaskId, deleteTask, intl],
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
        <TaskForm
          initialValues={initialValues}
          submitMessage={messages.submit}
          onSubmit={onSubmit}
        />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default CreateTask;

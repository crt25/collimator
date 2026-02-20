import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { LuEye, LuLock } from "react-icons/lu";
import Alert from "@/components/Alert";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import {
  useUpdateTask,
  getInitialSolutionOnly,
  appendOrUpdateInitialSolution,
} from "@/api/collimator/hooks/tasks/useUpdateTask";
import { useRevalidateTask } from "@/api/collimator/hooks/tasks/useRevalidateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import TaskNavigation from "@/components/task/TaskNavigation";
import TaskActions from "@/components/task/TaskActions";
import Breadcrumbs from "@/components/Breadcrumbs";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import { useIsCreator } from "@/hooks/useIsCreator";

const messages = defineMessages({
  title: {
    id: "EditTask.title",
    defaultMessage: "Edit Task - {title}",
  },
  submit: {
    id: "EditTask.submit",
    defaultMessage: "Save Task",
  },
  taskLockedTitle: {
    id: "EditTask.taskLockedTitle",
    defaultMessage: "Task is locked",
  },
  taskLockedDescription: {
    id: "EditTask.taskLockedDescription",
    defaultMessage:
      "This task is currently in active use by one or more classes and cannot be modified or deleted.",
  },
  taskReadOnlyTitle: {
    id: "EditTask.taskReadOnlyTitle",
    defaultMessage: "View only",
  },
  taskReadOnlyDescription: {
    id: "EditTask.taskReadOnlyDescription",
    defaultMessage:
      "You are viewing a public task created by another user. Only the creator can edit this task.",
  },
});

const EditTask = () => {
  const router = useRouter();
  const { taskId } = router.query as {
    taskId?: string;
  };

  const task = useTaskWithReferenceSolutions(taskId);
  const taskFile = useTaskFile(taskId);
  const updateTask = useUpdateTask();
  const revalidateTask = useRevalidateTask();

  const [formKey, setFormKey] = useState(0);

  const currentTaskId = task.data?.id;

  const handleConflictError = useCallback(() => {
    if (currentTaskId !== undefined) {
      revalidateTask(currentTaskId);
    }
    setFormKey((prev) => prev + 1);
  }, [currentTaskId, revalidateTask]);

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      if (!task.data || !taskSubmission.taskFile) {
        return;
      }

      const shouldClearAllSolutions =
        taskSubmission.clearAllReferenceSolutions ?? false;

      const [referenceSolutions, referenceSolutionsFiles] =
        // if we are clearing all solutions
        shouldClearAllSolutions
          ? // then we only keep the initial solution from the submission
            getInitialSolutionOnly(taskSubmission)
          : // otherwise we append or update the initial solution as usual
            appendOrUpdateInitialSolution(
              taskSubmission,
              task.data.referenceSolutions,
            );

      await updateTask(task.data.id, {
        ...taskSubmission,
        // typescript does not track property access through object spreads, so we need to re-add taskFile here
        taskFile: taskSubmission.taskFile,
        referenceSolutions,
        referenceSolutionsFiles,
      });
    },
    [task.data, updateTask],
  );

  const isCreator = useIsCreator(task.data?.creatorId);

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          title: task.data?.title ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb task={task.data} />
        </Breadcrumbs>
        <MultiSwrContent
          data={[task.data, taskFile.data]}
          isLoading={[task.isLoading, taskFile.isLoading]}
          errors={[task.error, taskFile.error]}
        >
          {([task, taskFile]) => {
            const initialSolution = task.referenceSolutions.find(
              (s) => s.isInitial,
            );
            const isLocked = task.isInUse;

            return (
              <>
                <PageHeading
                  actions={
                    !isLocked && isCreator && <TaskActions taskId={task?.id} />
                  }
                  description={task.description}
                >
                  {task.title}
                </PageHeading>
                <TaskNavigation taskId={task?.id} />
                {isLocked && isCreator && (
                  <Alert
                    icon={LuLock}
                    title={<FormattedMessage {...messages.taskLockedTitle} />}
                    description={
                      <FormattedMessage {...messages.taskLockedDescription} />
                    }
                  />
                )}
                {!isCreator && (
                  <Alert
                    icon={LuEye}
                    title={<FormattedMessage {...messages.taskReadOnlyTitle} />}
                    description={
                      <FormattedMessage {...messages.taskReadOnlyDescription} />
                    }
                  />
                )}
                {/* key={formKey} forces React to remount TaskForm when formKey changes,
                    resetting all form state to initialValues after a conflict error */}
                <TaskForm
                  key={formKey}
                  initialValues={{
                    ...task,
                    taskFile,
                    initialSolution: initialSolution ?? null,
                    initialSolutionFile: initialSolution?.solution ?? null,
                  }}
                  submitMessage={messages.submit}
                  hasReferenceSolutions={
                    // only consider reference solutions that are not marked as initial
                    task.referenceSolutions.some((s) => !s.isInitial)
                  }
                  onSubmit={onSubmit}
                  onConflictError={handleConflictError}
                  disabled={isLocked || !isCreator}
                />
              </>
            );
          }}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default EditTask;

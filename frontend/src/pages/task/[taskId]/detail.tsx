import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import { Alert, Container, Icon } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { LuEye, LuLock } from "react-icons/lu";
import { AuthenticationContext } from "@/contexts/AuthenticationContext";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import { useRevalidateTask } from "@/api/collimator/hooks/tasks/useRevalidateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import { UpdateReferenceSolutionDto } from "@/api/collimator/generated/models";
import TaskNavigation from "@/components/task/TaskNavigation";
import TaskActions from "@/components/task/TaskActions";
import Breadcrumbs from "@/components/Breadcrumbs";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

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

  const authContext = useContext(AuthenticationContext);
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
      if (task.data && taskFile.data) {
        let referenceSolutions: UpdateReferenceSolutionDto[];
        let referenceSolutionsFiles: Blob[];

        if (
          taskSubmission.initialSolution &&
          taskSubmission.initialSolutionFile
        ) {
          referenceSolutions = [
            ...task.data.referenceSolutions.filter((s) => !s.isInitial),
            taskSubmission.initialSolution,
          ];

          referenceSolutionsFiles = [
            ...task.data.referenceSolutions
              .filter((s) => !s.isInitial)
              .map((s) => s.solution),
            taskSubmission.initialSolutionFile,
          ];
        } else {
          referenceSolutions = [...task.data.referenceSolutions];
          referenceSolutionsFiles = [
            ...task.data.referenceSolutions.map((s) => s.solution),
          ];
        }

        await updateTask(task.data.id, {
          ...taskSubmission,
          referenceSolutions,
          referenceSolutionsFiles,
        });
      }
    },
    [task.data, taskFile.data, updateTask],
  );

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
            const isCreator =
              authContext.role !== undefined &&
              "userId" in authContext &&
              authContext.userId === task.creatorId;

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
                {(isLocked || !isCreator) && (
                  <Alert.Root status="info" mb={4}>
                    <Alert.Indicator>
                      <Icon as={isLocked ? LuLock : LuEye} />
                    </Alert.Indicator>
                    <Alert.Content>
                      <Alert.Title>
                        <FormattedMessage
                          {...(isLocked
                            ? messages.taskLockedTitle
                            : messages.taskReadOnlyTitle)}
                        />
                      </Alert.Title>
                      <Alert.Description>
                        <FormattedMessage
                          {...(isLocked
                            ? messages.taskLockedDescription
                            : messages.taskReadOnlyDescription)}
                        />
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
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

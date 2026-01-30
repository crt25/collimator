import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import ClassNavigation from "@/components/class/ClassNavigation";
import SessionNavigation from "@/components/session/SessionNavigation";
import TaskSessionActions from "@/components/task-instance/TaskSessionActions";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";
import {
  appendOrUpdateInitialSolution,
  getInitialSolutionOnly,
} from "@/utilities/task/task-instance";

const messages = defineMessages({
  title: {
    id: "TaskInstanceDetails.title",
    defaultMessage: "Edit Task - {title}",
  },
  submit: {
    id: "TaskInstanceDetails.submit",
    defaultMessage: "Save Task",
  },
});

const TaskInstanceDetails = () => {
  const router = useRouter();
  const { classId, sessionId, taskId } = router.query as {
    classId?: string;
    sessionId?: string;
    taskId?: string;
  };

  const {
    data: klass,
    error: klassError,
    isLoading: isLoadingKlass,
  } = useClass(classId);

  const {
    data: session,
    error: sessionError,
    isLoading: isLoadingSession,
  } = useClassSession(classId, sessionId);

  const task = useTaskWithReferenceSolutions(taskId);
  const taskFile = useTaskFile(taskId);
  const updateTask = useUpdateTask();

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      if (!task.data || !taskFile.data || !taskSubmission.taskFile) {
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
        taskFile: taskSubmission.taskFile,
        referenceSolutions,
        referenceSolutionsFiles,
      });
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
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation breadcrumb classId={klass?.id} session={session} />
          <SessionNavigation
            breadcrumb
            classId={klass?.id}
            sessionId={session?.id}
          />
        </Breadcrumbs>
        <MultiSwrContent
          data={[klass, session, task.data, taskFile.data]}
          isLoading={[
            isLoadingKlass,
            isLoadingSession,
            task.isLoading,
            taskFile.isLoading,
          ]}
          errors={[klassError, sessionError, task.error, taskFile.error]}
        >
          {([klass, session, task, taskFile]) => {
            const initialSolution = task.referenceSolutions.find(
              (s) => s.isInitial,
            );

            return (
              <>
                <PageHeading
                  variant="title"
                  actions={
                    <TaskSessionActions
                      classId={klass.id}
                      sessionId={session.id}
                      taskId={task.id}
                    />
                  }
                >
                  {task.title}
                </PageHeading>
                <TaskInstanceNavigation
                  classId={klass.id}
                  sessionId={session.id}
                  taskId={task.id}
                />
                <TaskForm
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

export default TaskInstanceDetails;

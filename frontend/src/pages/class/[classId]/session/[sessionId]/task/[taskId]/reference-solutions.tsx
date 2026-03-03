import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Container, Link } from "@chakra-ui/react";
import { LuCircleAlert } from "react-icons/lu";
import Alert from "@/components/Alert";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useUpdateTask } from "@/api/collimator/hooks/tasks/useUpdateTask";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import PageHeading from "@/components/PageHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import ClassNavigation from "@/components/class/ClassNavigation";
import SessionNavigation from "@/components/session/SessionNavigation";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import TaskFormReferenceSolutions, {
  TaskFormReferenceSolutionsSubmission,
} from "@/components/task/TaskFormReferenceSolutions";
import PageFooter from "@/components/PageFooter";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";

const messages = defineMessages({
  title: {
    id: "TaskInstanceReferenceSolutions.title",
    defaultMessage: "Edit Task - {title}",
  },
  submit: {
    id: "TaskInstanceReferenceSolutions.submit",
    defaultMessage: "Save Task",
  },
  editInTaskReferenceSolutionsTitle: {
    id: "TaskInstanceReferenceSolutions.editInTaskReferenceSolutionsTitle",
    description: "Title for the alert when trying to edit reference solutions",
    defaultMessage:
      "This reference solution cannot be edited here. To edit, go to {link}.",
  },
  editInTaskReferenceSolutionsDescription: {
    id: "TaskInstanceReferenceSolutions.editInTaskReferenceSolutions",
    description: "Title for the alert when trying to edit reference solutions",
    defaultMessage:
      "This reference solution cannot be edited here. To edit, go to {link}.",
  },
  taskReferenceSolutionsLink: {
    id: "TaskInstanceReferenceSolutions.taskReferenceSolutionsLink",
    description:
      "Link text for the alert when trying to edit reference solutions",
    defaultMessage: "the reference solutions detail",
  },
});

const TaskInstanceReferenceSolutions = () => {
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
    async ({
      referenceSolutions,
      referenceSolutionsFiles,
    }: TaskFormReferenceSolutionsSubmission) => {
      if (task.data && taskFile.data) {
        const initialSolution = task.data.referenceSolutions.find(
          (s) => s.isInitial,
        );

        if (initialSolution) {
          referenceSolutions.push(initialSolution);
          referenceSolutionsFiles.push(initialSolution.solution);
        }

        await updateTask(task.data.id, {
          ...task.data,
          taskFile: taskFile.data,
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
          {([klass, session, task, taskFile]) => (
            <>
              <PageHeading variant="title">{task.title}</PageHeading>
              <TaskInstanceNavigation
                classId={klass.id}
                sessionId={session.id}
                taskId={task.id}
              />
              <Alert
                icon={LuCircleAlert}
                title={
                  <FormattedMessage
                    {...messages.editInTaskReferenceSolutionsTitle}
                  />
                }
                description={
                  <FormattedMessage
                    {...messages.editInTaskReferenceSolutionsDescription}
                    values={{
                      link: (
                        <Link
                          color="blue.500"
                          textDecoration="underline"
                          cursor="pointer"
                          onClick={() =>
                            router.push(`/task/${taskId}/reference-solutions`)
                          }
                        >
                          <FormattedMessage
                            {...messages.taskReferenceSolutionsLink}
                          />
                        </Link>
                      ),
                    }}
                  />
                }
              />
              <TaskFormReferenceSolutions
                taskType={task.type}
                taskFile={taskFile}
                initialValues={{
                  referenceSolutions: task.referenceSolutions.filter(
                    (s) => !s.isInitial,
                  ),
                  referenceSolutionFiles: task.referenceSolutions
                    .filter((s) => !s.isInitial)
                    .reduce(
                      (acc, solution) => {
                        acc[solution.id] = solution.solution;
                        return acc;
                      },
                      {} as Record<number, Blob>,
                    ),
                }}
                submitMessage={messages.submit}
                onSubmit={onSubmit}
                disabled={true} // This form is read-only in this page, so it's always disabled
              />
            </>
          )}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default TaskInstanceReferenceSolutions;

import { useRouter } from "next/router";
import { defineMessages, FormattedMessage, useIntl } from "react-intl";
import { Alert, Container, Link } from "@chakra-ui/react";
import { LuCircleAlert } from "react-icons/lu";
import CrtNavigation from "@/components/CrtNavigation";
import Header from "@/components/header/Header";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useTaskFile } from "@/api/collimator/hooks/tasks/useTask";
import { useTaskWithReferenceSolutions } from "@/api/collimator/hooks/tasks/useTaskWithReferenceSolutions";
import TaskForm from "@/components/task/TaskForm";
import Button from "@/components/Button";
import PageHeading from "@/components/PageHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import ClassNavigation from "@/components/class/ClassNavigation";
import SessionNavigation from "@/components/session/SessionNavigation";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "TaskInstanceDetails.title",
    defaultMessage: "Task - {title}",
  },
  editInTaskBank: {
    id: "TaskInstanceDetails.editInTaskBank",
    defaultMessage:
      "This task cannot be edited here. To edit, go to the {link}.",
  },
  editNotAllowed: {
    id: "TaskInstanceDetails.editNotAllowed",
    defaultMessage:
      "This task cannot be edited because it is already in use in a lesson with enrolled students.",
  },
  taskBankLink: {
    id: "TaskInstanceDetails.taskBankLink",
    defaultMessage: "task bank",
  },
  submit: {
    id: "TaskInstanceDetails.submit",
    defaultMessage: "Save Task",
  },
  viewTask: {
    id: "TaskInstanceDetails.viewTask",
    defaultMessage: "View Task",
  },
});

const TaskInstanceDetails = () => {
  const intl = useIntl();

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
                <PageHeading variant="title">{task.title}</PageHeading>
                <TaskInstanceNavigation
                  classId={klass.id}
                  sessionId={session.id}
                  taskId={task.id}
                />
                <Alert.Root status="info" mb={4}>
                  <LuCircleAlert />
                  <Alert.Description>
                    {task.isInUse ? (
                      <FormattedMessage {...messages.editNotAllowed} />
                    ) : (
                      <FormattedMessage
                        {...messages.editInTaskBank}
                        values={{
                          link: (
                            <Link
                              color="blue.500"
                              textDecoration="underline"
                              cursor="pointer"
                              onClick={() =>
                                router.push(`/task/${task.id}/detail`)
                              }
                            >
                              {intl.formatMessage(messages.taskBankLink)}
                            </Link>
                          ),
                        }}
                      />
                    )}
                  </Alert.Description>
                </Alert.Root>

                <TaskForm
                  initialValues={{
                    ...task,
                    taskFile,
                    initialSolution: initialSolution ?? null,
                    initialSolutionFile: initialSolution?.solution ?? null,
                  }}
                  submitMessage={messages.submit}
                  onSubmit={async () => {}}
                  disabled={true}
                />
                <Button
                  mb={4}
                  onClick={() => router.push(`/task/${task.id}/view`)}
                >
                  {intl.formatMessage(messages.viewTask)}
                </Button>
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

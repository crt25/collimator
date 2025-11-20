import { useCallback } from "react";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import { useRouter } from "next/router";
import { useCreateTask } from "@/api/collimator/hooks/tasks/useCreateTask";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import TaskForm, { TaskFormSubmission } from "@/components/task/TaskForm";
import PageHeading from "@/components/PageHeading";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import ClassNavigation from "@/components/class/ClassNavigation";
import MultiSwrContent from "@/components/MultiSwrContent";

const messages = defineMessages({
  title: {
    id: "CreateTaskInstance.title",
    defaultMessage: "Create Task",
  },
  submit: {
    id: "CreateTaskInstance.submit",
    defaultMessage: "Create Task",
  },
});

const CreateTaskInstance = () => {
  const router = useRouter();
  const { classId, sessionId } = router.query as {
    classId: string;
    sessionId: string;
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

  const createTask = useCreateTask();

  const onSubmit = useCallback(
    async (taskSubmission: TaskFormSubmission) => {
      await createTask({
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
    },
    [createTask],
  );

  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation classId={klass?.id} breadcrumb session={session} />
        </Breadcrumbs>

        <MultiSwrContent
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
          data={[klass, session]}
        >
          {([_klass, _session]) => (
            <>
              <PageHeading
                description={
                  <FormattedMessage
                    id="CreateTaskInstance.description"
                    defaultMessage=""
                  />
                }
              >
                <FormattedMessage
                  id="CreateTaskInstance.header"
                  defaultMessage="Create Task"
                />
              </PageHeading>
              <TaskForm submitMessage={messages.submit} onSubmit={onSubmit} />
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default CreateTaskInstance;

import { useRouter } from "next/router";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/header/Header";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import DissimilarPairs from "@/components/dashboard/DissimilarPairs";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import PageHeading from "@/components/PageHeading";
import TaskSessionActions from "@/components/task-instance/TaskSessionActions";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "DissimilarAnalysisPairs.title",
    defaultMessage: "Dissimilar Pairs - {title}",
  },
});

const DissimilarAnalysisPairs = () => {
  const router = useRouter();
  const { classId, sessionId, taskId } = router.query as {
    classId: string;
    sessionId: string;
    taskId: string;
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

  const {
    data: task,
    error: taskError,
    isLoading: isLoadingTask,
  } = useTask(taskId);

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          title: task?.title ?? "",
        }}
      >
        <AnonymizationToggle />
      </Header>
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
          errors={[klassError, sessionError, taskError]}
          isLoading={[isLoadingKlass, isLoadingSession, isLoadingTask]}
          data={[klass, session, task]}
        >
          {([klass, session, task]) => (
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
              <DissimilarPairs session={session} task={task} />
            </>
          )}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default DissimilarAnalysisPairs;

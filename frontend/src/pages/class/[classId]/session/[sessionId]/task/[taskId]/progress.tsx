import { useRouter } from "next/router";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import PageHeading, { PageHeadingVariant } from "@/components/PageHeading";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import TaskInstanceProgressList from "@/components/task-instance/TaskInstanceProgressList";
import TaskSessionActions from "@/components/task-instance/TaskSessionActions";

const messages = defineMessages({
  title: {
    id: "TaskInstanceProgress.title",
    defaultMessage: "Progress - {title}",
  },
});

const TaskInstanceProgress = () => {
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
    <>
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
                variant={PageHeadingVariant.title}
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
              <TaskInstanceProgressList
                classId={klass.id}
                sessionId={session.id}
                taskId={task.id}
              />
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default TaskInstanceProgress;

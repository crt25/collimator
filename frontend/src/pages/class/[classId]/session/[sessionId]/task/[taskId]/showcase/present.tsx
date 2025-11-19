import { useRouter } from "next/router";
import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import { useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import PageHeading from "@/components/PageHeading";
import TaskSessionActions from "@/components/task-instance/TaskSessionActions";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import ShowcasePresentation from "@/components/dashboard/ShowcasePresentation";

const messages = defineMessages({
  title: {
    id: "TaskInstanceShowcasePresent.title",
    defaultMessage: "Showcase - {title}",
  },
});

const TaskInstanceShowcasePresent = () => {
  const router = useRouter();
  const { classId, sessionId, taskId, selected } = router.query as {
    classId: string;
    sessionId: string;
    taskId: string;
    selected: string;
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

  const selectedSolutionIds = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(selected));
    } catch {
      console.error(
        "Invalid selected solution IDs:",
        decodeURIComponent(selected),
      );
      return [];
    }
  }, [selected]);

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
              {Array.isArray(selectedSolutionIds) &&
              selectedSolutionIds.length > 0 ? (
                <ShowcasePresentation
                  klass={klass}
                  session={session}
                  task={task}
                  selectedSolutionIds={selectedSolutionIds}
                />
              ) : (
                <FormattedMessage
                  id="TaskInstanceShowcasePresent.noSolutionsSelected"
                  defaultMessage="No solutions selected for showcase presentation."
                />
              )}
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default TaskInstanceShowcasePresent;

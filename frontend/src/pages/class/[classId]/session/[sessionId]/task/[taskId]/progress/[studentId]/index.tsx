import { useRouter } from "next/router";
import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import SessionNavigation from "@/components/session/SessionNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useStudentName } from "@/hooks/useStudentName";
import CodeView from "@/components/dashboard/CodeView";
import { useTask } from "@/api/collimator/hooks/tasks/useTask";
import PageHeading from "@/components/PageHeading";
import TaskInstanceNavigation from "@/components/task-instance/TaskInstanceNavigation";
import { useAllSessionTaskSolutions } from "@/api/collimator/hooks/solutions/useAllSessionTaskSolutions";
import TaskSessionActions from "@/components/task-instance/TaskSessionActions";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "StudentTaskInstance.title",
    defaultMessage: "Student Solution - {name}",
  },
});

const StudentTaskInstance = () => {
  const router = useRouter();
  const {
    classId,
    sessionId,
    taskId,
    studentId: studentIdString,
  } = router.query as {
    classId: string;
    sessionId: string;
    taskId: string;
    studentId: string;
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

  const {
    data: solutions,
    error: solutionsError,
    isLoading: isLoadingSolutions,
  } = useAllSessionTaskSolutions(classId, sessionId, taskId);

  const studentId = parseInt(studentIdString, 10);
  const student = klass?.students.find((s) => s.studentId === studentId);

  const { name } = useStudentName({
    studentId,
    keyPairId: student?.keyPairId,
    pseudonym: student?.pseudonym,
  });

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          name: name ?? "",
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
          errors={[klassError, sessionError, taskError, solutionsError]}
          isLoading={[
            isLoadingKlass,
            isLoadingSession,
            isLoadingTask,
            isLoadingSolutions,
          ]}
          data={[klass, session, task, solutions]}
        >
          {([klass, session, task, solutions]) => {
            const hash = solutions.find((s) => s.studentId === studentId)
              ?.solution.hash;

            return (
              <>
                <PageHeading
                  actions={
                    <TaskSessionActions
                      classId={klass.id}
                      sessionId={session.id}
                      taskId={task.id}
                    />
                  }
                  description={name}
                >
                  {task.title}
                </PageHeading>
                <TaskInstanceNavigation
                  classId={klass.id}
                  sessionId={session.id}
                  taskId={task.id}
                />
                {hash ? (
                  <CodeView
                    classId={klass.id}
                    sessionId={session.id}
                    taskId={task.id}
                    taskType={task.type}
                    solutionHash={hash}
                  />
                ) : (
                  <FormattedMessage
                    id="StudentTaskInstance.solutionNotFound"
                    defaultMessage="No solution found."
                  />
                )}
              </>
            );
          }}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default StudentTaskInstance;

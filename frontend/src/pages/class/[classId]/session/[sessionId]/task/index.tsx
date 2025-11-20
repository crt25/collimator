import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import { useRouter } from "next/router";
import Header from "@/components/header/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";
import ClassNavigation from "@/components/class/ClassNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import MultiSwrContent from "@/components/MultiSwrContent";
import SessionActions from "@/components/session/SessionActions";
import SessionNavigation from "@/components/session/SessionNavigation";
import TaskInstanceTable from "@/components/task-instance/TaskInstanceTable";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "TaskInstanceList.title",
    defaultMessage: "Tasks",
  },
});

const TaskInstanceList = () => {
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

  return (
    <MaxScreenHeight>
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
          {([klass, session]) => (
            <>
              <PageHeading
                variant="title"
                actions={<SessionActions klass={klass} session={session} />}
              >
                {session.title}
              </PageHeading>
              <SessionNavigation classId={klass.id} sessionId={session.id} />
              <TaskInstanceTable klass={klass} session={session} />
            </>
          )}
        </MultiSwrContent>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default TaskInstanceList;

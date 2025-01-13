import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import ProgressList from "@/components/dashboard/ProgressList";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";

const messages = defineMessages({
  title: {
    id: "SessionProgress.title",
    defaultMessage: "Progress - {title}",
  },
});

const SessionProgress = () => {
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
    <>
      <Header
        title={messages.title}
        titleParameters={{
          title: session?.title ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation classId={klass?.id} breadcrumb session={session} />
        </Breadcrumbs>
        <SessionNavigation classId={klass?.id} sessionId={session?.id} />
        <PageHeader>
          <FormattedMessage
            id="SessionProgress.header"
            defaultMessage="Session Progress"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
          data={[klass, session]}
        >
          {([klass, session]) => (
            <ProgressList classId={klass.id} sessionId={session.id} />
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default SessionProgress;

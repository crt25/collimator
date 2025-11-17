import { useRouter } from "next/router";
import { defineMessages } from "react-intl";
import { Container } from "@chakra-ui/react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import ProgressList from "@/components/dashboard/ProgressList";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import PageHeading, { PageHeadingVariant } from "@/components/PageHeading";
import AnonymizationToggle from "@/components/AnonymizationToggle";
import SessionActions from "@/components/session/SessionActions";

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
      >
        <AnonymizationToggle />
      </Header>
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
                variant={PageHeadingVariant.title}
                actions={
                  <SessionActions klass={klass} sessionId={session.id} />
                }
              >
                {session.title}
              </PageHeading>
              <SessionNavigation classId={klass.id} sessionId={session.id} />
              <ProgressList classId={klass.id} sessionId={session.id} />
            </>
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default SessionProgress;

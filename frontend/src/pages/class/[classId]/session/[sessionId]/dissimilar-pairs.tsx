import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import DissimilarPairs from "@/components/dashboard/DissimilarPairs";

const messages = defineMessages({
  title: {
    id: "DissimilarAnalysisPairs.title",
    defaultMessage: "Dissimilar Pairs - {title}",
  },
});

const DissimilarAnalysisPairs = () => {
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
          <ClassNavigation breadcrumb classId={klass?.id} session={session} />
        </Breadcrumbs>
        <SessionNavigation classId={klass?.id} sessionId={session?.id} />
        <PageHeader>
          <FormattedMessage
            id="DissimilarAnalysisPairs.header"
            defaultMessage="Dissimilar Solutions"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
          data={[klass, session]}
        >
          {([_klass, session]) => <DissimilarPairs session={session} />}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default DissimilarAnalysisPairs;

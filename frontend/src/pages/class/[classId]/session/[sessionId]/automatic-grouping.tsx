import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";

const SessionAutomaticGrouping = () => {
  const router = useRouter();
  const { classId, sessionId: sessionIdString } = router.query as {
    classId: string;
    sessionId: string;
  };

  const { data: klass, error, isLoading: isLoadingClass } = useClass(classId);
  const sessionId = parseInt(sessionIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation
            classId={klass?.id}
            breadcrumb
            sessionId={sessionId}
          />
        </Breadcrumbs>
        <SessionNavigation classId={klass?.id} sessionId={sessionId} />
        <PageHeader>
          <FormattedMessage
            id="SessionAutomaticGrouping.header"
            defaultMessage="Automatic Grouping"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[error]}
          isLoading={[isLoadingClass]}
          data={[klass]}
        >
          {([_klass]) => sessionId}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default SessionAutomaticGrouping;

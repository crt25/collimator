import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const SessionManualGrouping = () => {
  const router = useRouter();
  const { classId: classIdString, sessionId: sessionIdString } =
    router.query as {
      classId: string;
      sessionId: string;
    };

  const classId = parseInt(classIdString, 10);
  const sessionId = parseInt(sessionIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb classId={classId} />
          <ClassNavigation classId={classId} breadcrumb sessionId={sessionId} />
        </Breadcrumbs>
        <SessionNavigation classId={classId} sessionId={sessionId} />
        <PageHeader>
          <FormattedMessage
            id="SessionManualGrouping.header"
            defaultMessage="Session Manual Progress"
          />
        </PageHeader>
        {sessionId}
      </Container>
    </>
  );
};

export default SessionManualGrouping;

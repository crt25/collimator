import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import SessionNavigation from "@/components/session/SessionNavigation";

const UserSessionProgress = () => {
  const router = useRouter();
  const {
    classId: classIdString,
    sessionId: sessionIdString,
    userId: userIdString,
  } = router.query as {
    classId: string;
    sessionId: string;
    userId: string;
  };

  const classId = parseInt(classIdString, 10);
  const sessionId = parseInt(sessionIdString, 10);
  const userId = parseInt(userIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb classId={classId} />
          <ClassNavigation breadcrumb classId={classId} sessionId={sessionId} />
          <SessionNavigation
            breadcrumb
            classId={classId}
            sessionId={sessionId}
            userId={userId}
          />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage
            id="UserSessionProgress.header"
            defaultMessage="User Progress"
          />
        </PageHeader>
      </Container>
    </>
  );
};

export default UserSessionProgress;

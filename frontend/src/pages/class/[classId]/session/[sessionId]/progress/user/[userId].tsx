import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import SessionNavigation from "@/components/session/SessionNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";

const UserSessionProgress = () => {
  const router = useRouter();
  const {
    classId,
    sessionId: sessionIdString,
    userId: userIdString,
  } = router.query as {
    classId: string;
    sessionId: string;
    userId: string;
  };

  const { data: klass, error, isLoading: isLoadingClass } = useClass(classId);
  const sessionId = parseInt(sessionIdString, 10);
  const userId = parseInt(userIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation
            breadcrumb
            classId={klass?.id}
            sessionId={sessionId}
          />
          <SessionNavigation
            breadcrumb
            classId={klass?.id}
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

export default UserSessionProgress;

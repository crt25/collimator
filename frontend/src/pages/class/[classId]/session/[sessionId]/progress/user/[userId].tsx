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
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import { useUser } from "@/api/collimator/hooks/users/useUser";

const UserSessionProgress = () => {
  const router = useRouter();
  const { classId, sessionId, userId } = router.query as {
    classId: string;
    sessionId: string;
    userId: string;
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
    data: user,
    error: userError,
    isLoading: isLoadingUser,
  } = useUser(userId);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation breadcrumb classId={klass?.id} session={session} />
          <SessionNavigation
            breadcrumb
            classId={klass?.id}
            sessionId={session?.id}
            user={user}
          />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage
            id="UserSessionProgress.header"
            defaultMessage="User Progress"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[klassError, sessionError, userError]}
          isLoading={[isLoadingKlass, isLoadingSession, isLoadingUser]}
          data={[klass, session, user]}
        >
          {([_klass]) => sessionId}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default UserSessionProgress;

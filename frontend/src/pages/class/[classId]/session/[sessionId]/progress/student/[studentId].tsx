import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import SessionNavigation from "@/components/session/SessionNavigation";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";
import { useClassSession } from "@/api/collimator/hooks/sessions/useClassSession";
import StudentProgress from "@/components/dashboard/StudentProgress";
import { useStudentName } from "@/hooks/useStudentName";

const messages = defineMessages({
  title: {
    id: "UserSessionProgress.title",
    defaultMessage: "Student Progress - {name}",
  },
});

const UserSessionProgress = () => {
  const router = useRouter();
  const {
    classId,
    sessionId,
    studentId: studentIdString,
  } = router.query as {
    classId: string;
    sessionId: string;
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

  const studentId = parseInt(studentIdString, 10);
  const student = klass?.students.find((s) => s.studentId === studentId);

  const { name } = useStudentName({
    studentId,
    keyPairId: student?.keyPairId,
    pseudonym: student?.pseudonym,
  });

  return (
    <>
      <Header
        title={messages.title}
        titleParameters={{
          name: name ?? "",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
          <ClassNavigation breadcrumb classId={klass?.id} session={session} />
          <SessionNavigation
            breadcrumb
            classId={klass?.id}
            sessionId={session?.id}
            student={student}
          />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage
            id="UserSessionProgress.header"
            defaultMessage="User Progress"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[klassError, sessionError]}
          isLoading={[isLoadingKlass, isLoadingSession]}
          data={[klass, session]}
        >
          {([klass, session]) => (
            <StudentProgress
              klass={klass}
              session={session}
              studentId={studentId}
            />
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default UserSessionProgress;

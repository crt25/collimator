import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionNavigation from "@/components/session/SessionNavigation";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import ProgressList, {
  UserProgress,
} from "@/components/dashboard/ProgressList";
import { useClass } from "@/api/collimator/hooks/classes/useClass";
import MultiSwrContent from "@/components/MultiSwrContent";

const progressList: UserProgress[] = [
  {
    userId: 1,
    name: "Student 1",
  },
  {
    userId: 2,
    name: "Student 2",
  },
  {
    userId: 3,
    name: "Student 3",
  },
  {
    userId: 4,
    name: "Student 4",
  },
  {
    userId: 5,
    name: "Student 5",
  },
  {
    userId: 6,
    name: "Student 6",
  },
  {
    userId: 7,
    name: "Student 7",
  },
  {
    userId: 8,
    name: "Student 8",
  },
];

const SessionProgress = () => {
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
            id="SessionProgress.header"
            defaultMessage="Session Progress"
          />
        </PageHeader>
        <MultiSwrContent
          errors={[error]}
          isLoading={[isLoadingClass]}
          data={[klass]}
        >
          {([klass]) => (
            <ProgressList
              classId={klass.id}
              sessionId={sessionId}
              fetchData={() =>
                Promise.resolve({
                  items: progressList,
                  totalCount: progressList.length,
                })
              }
            />
          )}
        </MultiSwrContent>
      </Container>
    </>
  );
};

export default SessionProgress;

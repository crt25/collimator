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
            id="SessionProgress.header"
            defaultMessage="Session Progress"
          />
        </PageHeader>
        <ProgressList
          classId={classId}
          sessionId={sessionId}
          fetchData={() =>
            Promise.resolve({
              items: progressList,
              totalCount: progressList.length,
            })
          }
        />
      </Container>
    </>
  );
};

export default SessionProgress;

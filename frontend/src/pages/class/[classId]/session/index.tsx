import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import SessionList, { Session } from "@/components/session/SessionList";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const sessions: Session[] = [
  {
    id: 1,
    name: "Session 1",
    tags: ["blue", "red", "green"],
  },
  {
    id: 2,
    name: "Session 2",
    tags: ["blue", "red", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
  {
    id: 3,
    name: "Session 3",
    tags: ["blue", "red"],
    startedAt: new Date("2021-01-15"),
  },
  {
    id: 4,
    name: "Session 4",
    tags: ["blue"],
    startedAt: new Date("2021-02-21"),
  },
  {
    id: 5,
    name: "Session 5",
    tags: ["green"],
    startedAt: new Date("2022-01-01"),
    finishedAt: new Date("2022-01-02"),
  },
  {
    id: 6,
    name: "Session 6",
    tags: ["blue", "red", "green"],
    startedAt: new Date("2023-05-12"),
    finishedAt: new Date("2023-05-13"),
  },
  {
    id: 7,
    name: "Session 7",
    tags: ["red", "green"],
    startedAt: new Date("2021-01-01"),
  },
  {
    id: 8,
    name: "Session 8",
    tags: ["blue", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
  {
    id: 9,
    name: "Session 9",
    tags: ["blue", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
  {
    id: 10,
    name: "Session 10",
    tags: ["blue", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
  {
    id: 11,
    name: "Session 11",
    tags: ["blue", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
  {
    id: 12,
    name: "Session 12",
    tags: ["blue", "green"],
    startedAt: new Date("2021-01-01"),
    finishedAt: new Date("2021-01-02"),
  },
];

const ClassSessionList = () => {
  const router = useRouter();
  const { classId: classIdString } = router.query as {
    classId: string;
  };

  const classId = parseInt(classIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb classId={classId} />
        </Breadcrumbs>
        <ClassNavigation classId={classId} />
        <PageHeader>
          <FormattedMessage
            id="ClassSessions.header"
            defaultMessage="Class Sessions"
          />
        </PageHeader>
        <SessionList
          classId={classId}
          fetchData={() =>
            Promise.resolve({ items: sessions, totalCount: sessions.length })
          }
        />
      </Container>
    </>
  );
};

export default ClassSessionList;

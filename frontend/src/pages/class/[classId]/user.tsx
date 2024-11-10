import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserList, { User } from "@/components/user/UserList";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { UserRole } from "@/i18n/user-role-messages";
import SwrContent from "@/components/SwrContent";
import { useClass } from "@/api/collimator/hooks/classes/useClass";

const users: User[] = [
  {
    id: 1,
    name: "User 1",
    role: UserRole.teacher,
  },
  {
    id: 2,
    name: "User 2",
    role: UserRole.student,
  },
  {
    id: 3,
    name: "User 3",
    role: UserRole.student,
  },
  {
    id: 4,
    name: "User 4",
    role: UserRole.admin,
  },
  {
    id: 5,
    name: "User 5",
    role: UserRole.student,
  },
  {
    id: 6,
    name: "User 6",
    role: UserRole.teacher,
  },
  {
    id: 7,
    name: "User 7",
    role: UserRole.student,
  },
  {
    id: 8,
    name: "User 8",
    role: UserRole.admin,
  },
  {
    id: 9,
    name: "User 9",
    role: UserRole.admin,
  },
  {
    id: 10,
    name: "User 10",
    role: UserRole.admin,
  },
  {
    id: 11,
    name: "User 11",
    role: UserRole.admin,
  },
];

const ClassUserList = () => {
  const router = useRouter();
  const { classId } = router.query as {
    classId: string;
  };

  const { data: klass, error, isLoading } = useClass(classId);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb klass={klass} />
        </Breadcrumbs>
        <ClassNavigation classId={klass?.id} />
        <SwrContent error={error} isLoading={isLoading} data={klass}>
          {(klass) => (
            <>
              <PageHeader>{klass.name}</PageHeader>
              <UserList
                fetchData={() =>
                  Promise.resolve({ items: users, totalCount: users.length })
                }
              />
            </>
          )}
        </SwrContent>
      </Container>
    </>
  );
};

export default ClassUserList;

import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserList, { User } from "@/components/user/UserList";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import { UserRole } from "@/i18n/user-role-messages";

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

const ListUsers = () => {
  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListUsers.header"
            defaultMessage="User Manager"
          />
        </PageHeader>
        <UserList
          fetchData={() =>
            Promise.resolve({ items: users, totalCount: users.length })
          }
        />
      </Container>
    </>
  );
};

export default ListUsers;

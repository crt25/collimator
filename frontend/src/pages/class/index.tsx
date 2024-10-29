import ClassList, { Class } from "@/components/class/ClassList";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ClassStatus } from "@/i18n/class-status-messages";

const classes: Class[] = [
  {
    id: 100,
    name: "Class 1",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.current,
  },
  {
    id: 1,
    name: "Class 2",
    lastSession: {
      id: 1,
      name: "Session 1",
    },
    status: ClassStatus.current,
  },
  {
    id: 2,
    name: "Class 3",
    lastSession: null,
    status: ClassStatus.current,
  },
  {
    id: 3,
    name: "Class 4",
    lastSession: {
      id: 1,
      name: "Session 5",
    },
    status: ClassStatus.past,
  },
  {
    id: 4,
    name: "Class 5",
    lastSession: {
      id: 1,
      name: "Session 3",
    },
    status: ClassStatus.current,
  },
  {
    id: 5,
    name: "Class 6",
    lastSession: {
      id: 1,
      name: "Session 2",
    },
    status: ClassStatus.past,
  },
  {
    id: 6,
    name: "Class 7",
    lastSession: {
      id: 1,
      name: "Session 7",
    },
    status: ClassStatus.current,
  },
  {
    id: 7,
    name: "Class 8",
    lastSession: null,
    status: ClassStatus.past,
  },
];

const ListClasses = () => {
  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListClasses.header"
            defaultMessage="Class Manager"
          />
        </PageHeader>
        <ClassList
          fetchData={() =>
            Promise.resolve({
              items: classes,
              totalCount: classes.length,
            })
          }
        />
      </Container>
    </>
  );
};

export default ListClasses;

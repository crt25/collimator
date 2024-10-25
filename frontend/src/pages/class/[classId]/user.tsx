import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import UserList from "@/components/user/UserList";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const ClassUserList = () => {
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
            id="ClassUserList.header"
            defaultMessage="Class Users"
          />
        </PageHeader>
        <UserList />
      </Container>
    </>
  );
};

export default ClassUserList;

import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import UserNavigation from "@/components/user/LessonNavigation";

const UserDetail = () => {
  const router = useRouter();
  const { userId: userIdString } = router.query as {
    userId: string;
  };

  const userId = parseInt(userIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <UserNavigation userId={userId} />
        <PageHeader>
          <FormattedMessage id="UserDetail.header" defaultMessage="User" />
        </PageHeader>
      </Container>
    </>
  );
};

export default UserDetail;

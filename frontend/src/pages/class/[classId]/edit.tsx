import Breadcrumbs from "@/components/Breadcrumbs";
import ClassNavigation from "@/components/class/ClassNavigation";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import ClassForm from "@/components/class/ClassForm";

const messages = defineMessages({
  submit: {
    id: "EditClass.submit",
    defaultMessage: "Save Class",
  },
});

const EditClass = () => {
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
          <FormattedMessage id="EditClass.header" defaultMessage="Edit Class" />
        </PageHeader>
        <ClassForm submitMessage={messages.submit} onSubmit={console.log} />
      </Container>
    </>
  );
};

export default EditClass;

import ClassForm from "@/components/class/ClassForm";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  submit: {
    id: "CreateClass.submit",
    defaultMessage: "Create Class",
  },
});

const CreateClass = () => {
  return (
    <>
      <Header />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="CreateClass.header"
            defaultMessage="Create Class"
          />
        </PageHeader>
        <ClassForm submitMessage={messages.submit} />
      </Container>
    </>
  );
};

export default CreateClass;

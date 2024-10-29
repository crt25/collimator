import Header from "@/components/Header";
import LessonForm from "@/components/lesson/LessonForm";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  submit: {
    id: "CreateLesson.submit",
    defaultMessage: "Create Lesson",
  },
});

const CreateLesson = () => {
  return (
    <>
      <Header />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="CreateLesson.header"
            defaultMessage="Create Lesson"
          />
        </PageHeader>
        <LessonForm submitMessage={messages.submit} onSubmit={console.log} />
      </Container>
    </>
  );
};

export default CreateLesson;
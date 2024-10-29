import Header from "@/components/Header";
import LessonForm from "@/components/lesson/LessonForm";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";

const messages = defineMessages({
  submit: {
    id: "EditLesson.submit",
    defaultMessage: "Save Lesson",
  },
});

const EditLesson = () => {
  return (
    <>
      <Header />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="EditLesson.header"
            defaultMessage="Edit Lesson"
          />
        </PageHeader>
        <LessonForm submitMessage={messages.submit} onSubmit={console.log} />
      </Container>
    </>
  );
};

export default EditLesson;

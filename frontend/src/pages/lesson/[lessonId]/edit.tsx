import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/header/Header";
import LessonForm from "@/components/lesson/LessonForm";
import CrtNavigation from "@/components/CrtNavigation";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "EditLesson.title",
    defaultMessage: "Edit Lesson - {name}",
  },
  submit: {
    id: "EditLesson.submit",
    defaultMessage: "Save Lesson",
  },
});

const EditLesson = () => {
  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          name: "Lesson 1",
        }}
      />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage
            id="EditLesson.header"
            defaultMessage="Edit Lesson"
          />
        </PageHeading>
        <LessonForm submitMessage={messages.submit} onSubmit={console.log} />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default EditLesson;

import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import LessonForm from "@/components/lesson/LessonForm";
import CrtNavigation from "@/components/CrtNavigation";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "CreateLesson.title",
    defaultMessage: "Create Lesson",
  },
  submit: {
    id: "CreateLesson.submit",
    defaultMessage: "Create Lesson",
  },
});

const CreateLesson = () => {
  return (
    <MaxScreenHeight>
      <Header title={messages.title} />
      <Container>
        <CrtNavigation />
        <PageHeading>
          <FormattedMessage
            id="CreateLesson.header"
            defaultMessage="Create Lesson"
          />
        </PageHeading>
        <LessonForm submitMessage={messages.submit} onSubmit={console.log} />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default CreateLesson;

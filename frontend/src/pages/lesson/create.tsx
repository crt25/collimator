import { defineMessages } from "react-intl";
import LessonForm from "@/components/lesson/LessonForm";
import CrtNavigation from "@/components/CrtNavigation";
import PageLayout from "@/components/layout/PageLayout";

const messages = defineMessages({
  title: {
    id: "CreateLesson.title",
    defaultMessage: "Create Lesson",
  },
  heading: {
    id: "CreateLesson.header",
    defaultMessage: "Create Lesson",
  },
  submit: {
    id: "CreateLesson.submit",
    defaultMessage: "Create Lesson",
  },
});

const CreateLesson = () => {
  return (
    <PageLayout
      title={messages.title}
      heading={messages.heading}
      breadcrumbs={<CrtNavigation breadcrumb />}
    >
      <LessonForm submitMessage={messages.submit} onSubmit={console.log} />
    </PageLayout>
  );
};

export default CreateLesson;

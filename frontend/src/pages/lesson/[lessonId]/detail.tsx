import { useRouter } from "next/router";
import { Container } from "@chakra-ui/react";
import { defineMessages, FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import LessonNavigation from "@/components/lesson/LessonNavigation";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  title: {
    id: "LessonDetail.title",
    defaultMessage: "Lesson - {name}",
  },
});

const LessonDetail = () => {
  const router = useRouter();
  const { lessonId: lessonIdString } = router.query as {
    lessonId: string;
  };

  const lessonId = parseInt(lessonIdString, 10);

  return (
    <MaxScreenHeight>
      <Header
        title={messages.title}
        titleParameters={{
          name: "Lesson 1",
        }}
      />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <LessonNavigation lessonId={lessonId} />
        <PageHeading>
          <FormattedMessage id="LessonDetail.header" defaultMessage="Lesson" />
        </PageHeading>
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default LessonDetail;

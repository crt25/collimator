import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { useRouter } from "next/router";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import LessonNavigation from "@/components/lesson/LessonNavigation";

const LessonDetail = () => {
  const router = useRouter();
  const { lessonId: lessonIdString } = router.query as {
    lessonId: string;
  };

  const lessonId = parseInt(lessonIdString, 10);

  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <LessonNavigation lessonId={lessonId} />
        <PageHeader>
          <FormattedMessage id="LessonDetail.header" defaultMessage="Lesson" />
        </PageHeader>
      </Container>
    </>
  );
};

export default LessonDetail;

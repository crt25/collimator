import Breadcrumbs from "@/components/Breadcrumbs";
import Header from "@/components/Header";
import LessonList from "@/components/lesson/LessonList";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const ListLessons = () => {
  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage
            id="ListLessons.header"
            defaultMessage="Lesson Manager"
          />
        </PageHeader>
        <LessonList />
      </Container>
    </>
  );
};

export default ListLessons;

import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";

const messages = defineMessages({
  title: {
    id: "ListClasses.title",
    defaultMessage: "Classes",
  },
});

const ListClasses = () => {
  return (
    <>
      <Header title={messages.title} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage
            id="ListClasses.header"
            defaultMessage="Class Manager"
          />
        </PageHeader>
        <ClassList />
      </Container>
    </>
  );
};

export default ListClasses;

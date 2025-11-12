import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeader from "@/components/PageHeader";
import PageDescription from "@/components/PageDescription";

const messages = defineMessages({
  header: {
    id: "ListClasses.header",
    defaultMessage: "Classes",
  },
  description: {
    id: "ListClasses.description",
    defaultMessage: "",
  },
});

const ListClasses = () => {
  return (
    <>
      <Header title={messages.header} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <PageHeader>
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Class Manager"
          />
        </PageHeader>
        <PageDescription>
          <FormattedMessage
            id="ListClasses.pageDescription"
            defaultMessage=""
          />
        </PageDescription>
        <ClassList />
      </Container>
    </>
  );
};

export default ListClasses;

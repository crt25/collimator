import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";

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
        <PageHeading
          description={
            <FormattedMessage
              id="ListClasses.pageDescription"
              defaultMessage=""
            />
          }
        >
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Class Manager"
          />
        </PageHeading>
        <ClassList />
      </Container>
    </>
  );
};

export default ListClasses;

import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading from "@/components/PageHeading";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import PageFooter from "@/components/PageFooter";

const messages = defineMessages({
  header: {
    id: "ListClasses.header",
    defaultMessage: "Classes",
  },
  description: {
    id: "ListClasses.pageDescription",
    defaultMessage:
      "This page displays the classes you have created. " +
      "Click on a given class to edit the lessons and see your students’ progress.",
  },
});

const ListClasses = () => {
  return (
    <MaxScreenHeight>
      <Header title={messages.header} />
      <Container>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <PageHeading
          description={<FormattedMessage {...messages.description} />}
        >
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Class Manager"
          />
        </PageHeading>
        <ClassList />
      </Container>
      <PageFooter />
    </MaxScreenHeight>
  );
};

export default ListClasses;

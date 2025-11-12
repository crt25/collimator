import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageHeading, { PageHeadingVariant } from "@/components/PageHeading";

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
        <PageHeading variant={PageHeadingVariant.title}>
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Class Manager"
          />
        </PageHeading>
        <PageHeading variant={PageHeadingVariant.description}>
          <FormattedMessage
            id="ListClasses.pageDescription"
            defaultMessage=""
          />
        </PageHeading>
        <ClassList />
      </Container>
    </>
  );
};

export default ListClasses;

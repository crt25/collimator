import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import { Heading } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";

const messages = defineMessages({
  header: {
    id: "ListClasses.header",
    defaultMessage: "Classes",
  },
});

const StyledHeading = styled(Heading)`
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const StyledContainer = styled(Container)`
  padding-top: 0;
  padding-left: 0;
`;

const PageDescription = styled.p`
  font-size: 1rem;
  color: var(--page-description-color);
  margin-top: 1rem;
  margin-bottom: 3rem;
`;

const ListClasses = () => {
  return (
    <>
      <Header title={messages.header} />
      <StyledContainer>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <StyledHeading>
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Class Manager"
          />
        </StyledHeading>
        <PageDescription>
          <FormattedMessage
            id="ListClasses.pageDescription"
            defaultMessage=""
          />
        </PageDescription>
        <ClassList />
      </StyledContainer>
    </>
  );
};

export default ListClasses;

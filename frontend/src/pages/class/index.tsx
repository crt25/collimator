import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import styled from "@emotion/styled";
import { Heading } from "@chakra-ui/react";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";

const messages = defineMessages({
  title: {
    id: "ListClasses.title",
    defaultMessage: "Classes",
  },
});

const StyledContainer = styled(Container)`
  padding-top: 0;
  padding-left: 0;
`;

const PageDescription = styled.p`
  font-size: 1rem;
  color: #000000ff;
  margin-top: 1rem;
  margin-bottom: 3rem;
`;

const ListClasses = () => {
  return (
    <>
      <Header title={messages.title} />
      <StyledContainer>
        <Breadcrumbs>
          <CrtNavigation breadcrumb />
        </Breadcrumbs>
        <Heading mt="10" mb="2">
          <FormattedMessage
            id="ListClasses.pageTitle"
            defaultMessage="Classes Page Title"
          />
        </Heading>
        <PageDescription>
          <FormattedMessage
            id="ListClasses.pageDescription"
            defaultMessage="Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est."
          />
        </PageDescription>
        <ClassList />
      </StyledContainer>
    </>
  );
};

export default ListClasses;
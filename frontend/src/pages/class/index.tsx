import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import Breadcrumbs from "@/components/Breadcrumbs";

const ListClasses = () => {
  return (
    <>
      <Header />
      <Container>
        <Breadcrumbs />
        <CrtNavigation />
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

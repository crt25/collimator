import ClassList from "@/components/class/ClassList";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useFetchAllClasses } from "@/api/collimator/hooks/classes/useAllClasses";

const ListClasses = () => {
  const fetchData = useFetchAllClasses();

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
        <ClassList fetchData={fetchData} />
      </Container>
    </>
  );
};

export default ListClasses;

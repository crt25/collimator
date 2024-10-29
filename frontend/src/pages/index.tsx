import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";
import { Container } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const Home = () => {
  return (
    <>
      <Header />
      <Container>
        <CrtNavigation />
        <PageHeader>
          <FormattedMessage id="Home.header" defaultMessage="Home" />
        </PageHeader>
      </Container>
    </>
  );
};

export default Home;

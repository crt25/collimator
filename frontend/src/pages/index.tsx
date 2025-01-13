import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import CrtNavigation from "@/components/CrtNavigation";

const messages = defineMessages({
  title: {
    id: "Home.title",
    defaultMessage: "Home",
  },
});

const Home = () => {
  return (
    <>
      <Header title={messages.title} />
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

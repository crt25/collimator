import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useDeAuthenticate } from "@/hooks/useDeAuthenticate";
import { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const LogoutPage = () => {
  const deAuthenticate = useDeAuthenticate();

  useEffect(() => {
    deAuthenticate();
  }, [deAuthenticate]);

  return (
    <>
      <Header />
      <Container>
        <PageHeader>
          <FormattedMessage
            id="LogoutPage.deAuthenticating"
            defaultMessage="You are being logged out..."
          />
        </PageHeader>
        <Spinner animation="border" role="status" />
      </Container>
    </>
  );
};

export default LogoutPage;

import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import { useLogout } from "@/hooks/useLogout";
import { useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { FormattedMessage } from "react-intl";

const LogoutPage = () => {
  const logout = useLogout();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <>
      <Header />
      <Container>
        <PageHeader>
          <FormattedMessage
            id="LogoutPage.loggingOut"
            defaultMessage="You are being logged out..."
          />
        </PageHeader>
        <Spinner animation="border" role="status" />
      </Container>
    </>
  );
};

export default LogoutPage;

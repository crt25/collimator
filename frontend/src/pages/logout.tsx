import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import ProgressSpinner from "@/components/ProgressSpinner";
import { useLogout } from "@/hooks/useLogout";
import { useEffect } from "react";
import { Container } from "react-bootstrap";
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
        <ProgressSpinner />
      </Container>
    </>
  );
};

export default LogoutPage;

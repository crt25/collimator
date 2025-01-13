import { useEffect } from "react";
import { Container } from "react-bootstrap";
import { defineMessages, FormattedMessage } from "react-intl";
import Header from "@/components/Header";
import PageHeader from "@/components/PageHeader";
import ProgressSpinner from "@/components/ProgressSpinner";
import { useLogout } from "@/hooks/useLogout";

const messages = defineMessages({
  title: {
    id: "LogoutPage.title",
    defaultMessage: "Logout",
  },
});

const LogoutPage = () => {
  const logout = useLogout();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <>
      <Header title={messages.title} />
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

import { useEffect } from "react";
import { defineMessages, FormattedMessage } from "react-intl";
import { Container } from "@chakra-ui/react";
import Header from "@/components/Header";
import ProgressSpinner from "@/components/ProgressSpinner";
import { useLogout } from "@/hooks/useLogout";
import PageHeading from "@/components/PageHeading";

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
        <PageHeading>
          <FormattedMessage
            id="LogoutPage.loggingOut"
            defaultMessage="You are being logged out..."
          />
        </PageHeading>
        <ProgressSpinner />
      </Container>
    </>
  );
};

export default LogoutPage;

import React from "react";
import {
  defineMessages,
  MessageDescriptor,
  PrimitiveType,
  useIntl,
} from "react-intl";
import Head from "next/head";
import { chakra, Container } from "@chakra-ui/react";
import HeaderMenu from "./HeaderMenu";
import HeaderLogo from "./HeaderLogo";

const StyledHeader = chakra("header", {
  base: {
    padding: "{padding.sm} 0",
    backgroundColor: "headerBackground",
  },
});

const HeaderInner = chakra("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    height: "{lineHeights.md}",
    alignItems: "center",
    padding: "0",
  },
});

const messages = defineMessages({
  applicationName: {
    id: "Header.applicationName",
    defaultMessage: "ClassMosaic",
  },
});

const Header = ({
  title,
  titleParameters,
  description,
  children,
  hideSignIn = false,
}: {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  description?: MessageDescriptor;
  children?: React.ReactNode;
  hideSignIn?: boolean;
}) => {
  const intl = useIntl();

  return (
    <>
      <Head>
        <title>
          {`${intl.formatMessage(messages.applicationName)} - ${intl.formatMessage(title, titleParameters)}`}
        </title>
        {description && (
          <meta name="description" content={intl.formatMessage(description)} />
        )}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <StyledHeader>
        <Container>
          <HeaderInner>
            <HeaderLogo />
            <HeaderMenu hideSignIn={hideSignIn}>{children}</HeaderMenu>
          </HeaderInner>
        </Container>
      </StyledHeader>
    </>
  );
};

export default Header;

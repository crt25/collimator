import Link from "next/link";
import React from "react";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  PrimitiveType,
  useIntl,
} from "react-intl";
import Head from "next/head";
import { FaRegUser } from "react-icons/fa6";
import { chakra, Container } from "@chakra-ui/react";
import AvatarMenu from "../Avatar";
import LanguageChooser from "../LanguageChooser";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";

const messages = defineMessages({
  applicationName: {
    id: "Header.applicationName",
    defaultMessage: "ClassMosaic",
  },
});

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

const Logo = chakra("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "2xl",
    fontWeight: "bold",

    "& img, & svg": {
      maxHeight: "{spacing.xl}",
      height: "100%",
      width: "auto",
    },
  },
});

const Menu = chakra("menu", {
  base: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "4xl",
    listStyle: "none",
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
  const isAuthenticated = useIsAuthenticated();
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
            <Logo>{intl.formatMessage(messages.applicationName)}</Logo>
            <Menu>
              {children ?? null}
              <li>
                <LanguageChooser />
              </li>
              {!hideSignIn && (
                <li>
                  {isAuthenticated ? (
                    <AvatarMenu icon={<FaRegUser />} testId="current-user">
                      <AvatarMenu.Item href="/logout">
                        <FormattedMessage
                          id="Header.signOut"
                          defaultMessage="Sign Out"
                        />
                      </AvatarMenu.Item>
                    </AvatarMenu>
                  ) : (
                    <Link href="/login" data-testid="sign-in-button">
                      <FormattedMessage
                        id="Header.signIn"
                        defaultMessage="Sign In"
                      />
                    </Link>
                  )}
                </li>
              )}
            </Menu>
          </HeaderInner>
        </Container>
      </StyledHeader>
    </>
  );
};

export default Header;

import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";
import { Container } from "react-bootstrap";
import {
  defineMessages,
  FormattedMessage,
  MessageDescriptor,
  PrimitiveType,
  useIntl,
} from "react-intl";
import Head from "next/head";
import { useUserName } from "@/hooks/useUserName";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import LanguageChooser from "./LanguageChooser";
import DropdownMenu from "./DropdownMenu";

const messages = defineMessages({
  applicationName: {
    id: "Header.applicationName",
    defaultMessage: "ClassMosaic",
  },
});

const StyledHeader = styled.header`
  padding: 1rem 0;
  background-color: var(--header-background-color);
  color: var(--header-foreground-color);
`;

const HeaderInner = styled(Container)`
  display: flex;
  flex-direction: row;
  height: 3rem;
  align-items: center;
  padding: 0;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 1.5rem;
  font-weight: bold;

  img,
  svg {
    max-height: 4rem;
    height: 100%;
    width: auto;
  }
`;

const Menu = styled.menu`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  list-style: none;
`;

const Header = ({
  title,
  titleParameters,
  description,
  children,
}: {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  description?: MessageDescriptor;
  children?: React.ReactNode;
}) => {
  const isAuthenticated = useIsAuthenticated();
  const name = useUserName();
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
        <HeaderInner>
          <Logo>{intl.formatMessage(messages.applicationName)}</Logo>
          <Menu>
            {children ?? null}
            <li>
              <LanguageChooser />
            </li>
            <li>
              {isAuthenticated ? (
                <DropdownMenu
                  trigger={<div data-testid="current-user">{name}</div>}
                  isButton={true}
                >
                  <DropdownMenu.Item href="/logout">
                    <FormattedMessage
                      id="Header.signOut"
                      defaultMessage="Sign Out"
                    />
                  </DropdownMenu.Item>
                </DropdownMenu>
              ) : (
                <Link href="/login" data-testid="sign-in-button">
                  <FormattedMessage
                    id="Header.signIn"
                    defaultMessage="Sign In"
                  />
                </Link>
              )}
            </li>
          </Menu>
        </HeaderInner>
      </StyledHeader>
    </>
  );
};

export default Header;

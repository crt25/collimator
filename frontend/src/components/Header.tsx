import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";
import { Container, Dropdown } from "react-bootstrap";
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
import DropdownLinkItem from "./dropdown/DropdownLinkItem";
import LanguageChooser from "./LanguageChooser";

const messages = defineMessages({
  applicationName: {
    id: "Header.applicationName",
    defaultMessage: "ClassMosaic",
  },
});

const StyledHeader = styled.header`
  padding: 0.5rem 0;
  background-color: var(--header-background-color);
  color: var(--header-foreground-color);
`;

const HeaderInner = styled(Container)`
  display: flex;
  flex-direction: row;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

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
          {intl.formatMessage(messages.applicationName)} -{" "}
          {intl.formatMessage(title, titleParameters)}
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
                <Dropdown>
                  <Dropdown.Toggle data-testid="current-user">
                    {name}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <DropdownLinkItem href="/logout">
                      <FormattedMessage
                        id="Header.signOut"
                        defaultMessage="Sign Out"
                      />
                    </DropdownLinkItem>
                  </Dropdown.Menu>
                </Dropdown>
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

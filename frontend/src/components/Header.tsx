import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import { useUserEmail } from "@/hooks/useUserEmail";
import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";
import { Container, Dropdown } from "react-bootstrap";
import { FormattedMessage } from "react-intl";
import DropdownLinkItem from "./dropdown/DropdownLinkItem";

const StyledHeader = styled.header`
  padding: 0.5rem 0;
  background-color: var(--header-background-color);
  color: var(--header-foreground-color);

  --button-background-color: #fff;
  --button-foreground-color: var(--header-foreground-color);
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

const Header = ({ children }: { children?: React.ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  const email = useUserEmail();

  return (
    <StyledHeader>
      <HeaderInner>
        <Logo>
          <img src="https://placeholder.pics/svg/300x100" alt="Logo" />
        </Logo>
        <Menu>
          {children ? children : null}
          <li>
            {isAuthenticated ? (
              <Dropdown>
                <Dropdown.Toggle data-testid="current-user">
                  {email}
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
                <FormattedMessage id="Header.signIn" defaultMessage="Sign In" />
              </Link>
            )}
          </li>
        </Menu>
      </HeaderInner>
    </StyledHeader>
  );
};

export default Header;

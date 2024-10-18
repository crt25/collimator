import styled from "@emotion/styled";
import Link from "next/link";
import React from "react";
import { Container } from "react-bootstrap";
import Button from "./Button";

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
  return (
    <StyledHeader>
      <HeaderInner>
        <Logo>
          <img src="https://placeholder.pics/svg/300x100" alt="Logo" />
        </Logo>
        <Menu>
          {children ? (
            children
          ) : (
            <React.Fragment>
              <li>
                <Link href="/">Contact</Link>
              </li>
              <li>
                <Link href="/">About</Link>
              </li>
            </React.Fragment>
          )}
          <li>
            <Button>Sign out</Button>
          </li>
        </Menu>
      </HeaderInner>
    </StyledHeader>
  );
};

export default Header;

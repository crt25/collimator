import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import { FaRegUser } from "react-icons/fa6";
import { chakra } from "@chakra-ui/react";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";
import AvatarMenu from "../Avatar";
import LanguageChooser from "../LanguageChooser";
import AnonymizationToggle from "../AnonymizationToggle";

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

const HeaderMenu = ({
  children,
  hideSignIn = false,
  showAnonymizationToggle = false,
}: {
  children?: React.ReactNode;
  hideSignIn?: boolean;
  showAnonymizationToggle?: boolean;
}) => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Menu>
      {children ?? null}
      {showAnonymizationToggle && (
        <li>
          <AnonymizationToggle />
        </li>
      )}
      <li>
        <LanguageChooser />
      </li>
      {!hideSignIn && (
        <li>
          {isAuthenticated ? (
            <AvatarMenu icon={<FaRegUser />} testId="user-menu">
              <AvatarMenu.Item href="/logout">
                <FormattedMessage
                  id="Header.signOut"
                  defaultMessage="Sign Out"
                />
              </AvatarMenu.Item>
            </AvatarMenu>
          ) : (
            <Link href="/login" data-testid="sign-in-button">
              <FormattedMessage id="Header.signIn" defaultMessage="Sign In" />
            </Link>
          )}
        </li>
      )}
    </Menu>
  );
};

export default HeaderMenu;

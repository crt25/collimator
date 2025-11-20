import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";
import { FaRegUser } from "react-icons/fa6";
import { chakra } from "@chakra-ui/react";
import AvatarMenu from "../Avatar";
import LanguageChooser from "../LanguageChooser";
import { useIsAuthenticated } from "@/hooks/useIsAuthenticated";

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
}: {
  children?: React.ReactNode;
  hideSignIn?: boolean;
}) => {
  const isAuthenticated = useIsAuthenticated();

  return (
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
              <FormattedMessage id="Header.signIn" defaultMessage="Sign In" />
            </Link>
          )}
        </li>
      )}
    </Menu>
  );
};

export default HeaderMenu;

import React from "react";
import { MessageDescriptor, PrimitiveType } from "react-intl";
import { chakra, Container } from "@chakra-ui/react";
import HeaderMenu from "./HeaderMenu";
import HeaderLogo from "./HeaderLogo";
import HtmlHead from "./HtmlHead";

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
  return (
    <>
      <HtmlHead
        title={title}
        titleParameters={titleParameters}
        description={description}
      />

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

import React from "react";
import { MessageDescriptor, PrimitiveType } from "react-intl";
import { chakra } from "@chakra-ui/react";
import HeaderMenu from "./HeaderMenu";
import HeaderLogo from "./HeaderLogo";
import HtmlHead from "./HtmlHead";

const StyledHeader = chakra("header", {
  base: {
    backgroundColor: "headerBackground",
  },
});

const HeaderInner = chakra("div", {
  base: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: "{padding.md} {padding.md}",
  },
});

const StudentHeader = ({
  title,
  titleParameters,
  description,
  logo,
  children,
  belowHeader,
  hideSignIn = false,
}: {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  description?: MessageDescriptor;
  logo?: React.ReactNode;
  children?: React.ReactNode;
  belowHeader?: React.ReactNode;
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
        <HeaderInner>
          {logo ?? <HeaderLogo variant="small" />}
          <HeaderMenu hideSignIn={hideSignIn}>{children}</HeaderMenu>
        </HeaderInner>
        {belowHeader}
      </StyledHeader>
    </>
  );
};

export default StudentHeader;

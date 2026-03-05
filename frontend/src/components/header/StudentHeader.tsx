import React, { useContext } from "react";
import { FormattedMessage, MessageDescriptor, PrimitiveType } from "react-intl";
import { chakra } from "@chakra-ui/react";
import {
  AuthenticationContext,
  isStudentAuthenticated,
} from "@/contexts/AuthenticationContext";
import { useStudentDisplayName } from "@/hooks/useStudentDisplayName";
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

const StudentUsername = chakra("span", {
  base: {
    marginLeft: "auto",
    paddingLeft: "4xl",
    fontWeight: "medium",
  },
});

const StudentHeader = ({
  title,
  titleParameters,
  description,
  logo,
  children,
  belowHeader,
}: {
  title: MessageDescriptor;
  titleParameters?: Record<string, PrimitiveType>;
  description?: MessageDescriptor;
  logo?: React.ReactNode;
  children?: React.ReactNode;
  belowHeader?: React.ReactNode;
}) => {
  const authContext = useContext(AuthenticationContext);
  const studentName = useStudentDisplayName();

  const isAnonymous =
    isStudentAuthenticated(authContext) && authContext.isAnonymous;

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
          <HeaderMenu hideSignIn={isAnonymous}>{children}</HeaderMenu>
          <StudentUsername>
            <FormattedMessage
              id="StudentHeader.studentLabel"
              defaultMessage="Student: {name}"
              values={{ name: studentName }}
            />
          </StudentUsername>
        </HeaderInner>
        {belowHeader}
      </StyledHeader>
    </>
  );
};

export default StudentHeader;

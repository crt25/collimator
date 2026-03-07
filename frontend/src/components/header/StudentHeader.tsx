import React, { useContext } from "react";
import {
  FormattedMessage,
  MessageDescriptor,
  PrimitiveType,
  useIntl,
} from "react-intl";

import { isLanguage } from "iframe-rpc/src";
import { chakra } from "@chakra-ui/react";
import {
  AuthenticationContext,
  isFullyAuthenticated,
  isStudentAuthenticated,
} from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { getStudentNickname } from "@/utilities/student-name";
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
  const intl = useIntl();
  const isAnonymous =
    isStudentAuthenticated(authContext) && authContext.isAnonymous;

  let studentName = "";

  if (
    authContext.role === UserRole.student &&
    isFullyAuthenticated(authContext)
  ) {
    const locale = isLanguage(intl.locale) ? intl.locale : undefined;
    const pseudonym = authContext.isAnonymous ? null : authContext.pseudonym;

    studentName = getStudentNickname(authContext.studentId, pseudonym, locale);
  }

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

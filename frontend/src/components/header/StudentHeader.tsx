import React, { useContext, useMemo } from "react";
import { MessageDescriptor, PrimitiveType, useIntl } from "react-intl";
import { chakra } from "@chakra-ui/react";
import { isLanguage } from "iframe-rpc-react/src";
import {
  AuthenticationContext,
  isStudentAuthenticated,
  isFullyAuthenticated,
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

  const studentNickname = useMemo(() => {
    // Student must be fully authenticated (have authenticationToken) to have a guaranteed studentId
    if (
      !isFullyAuthenticated(authContext) ||
      authContext.role !== UserRole.student
    ) {
      return null;
    }

    const locale = isLanguage(intl.locale) ? intl.locale : undefined;
    const pseudonym = authContext.isAnonymous
      ? undefined
      : authContext.pseudonym;

    return getStudentNickname(authContext.studentId, pseudonym, locale);
  }, [authContext, intl.locale]);

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
          {studentNickname && (
            <StudentUsername>{studentNickname}</StudentUsername>
          )}
        </HeaderInner>
        {belowHeader}
      </StyledHeader>
    </>
  );
};

export default StudentHeader;

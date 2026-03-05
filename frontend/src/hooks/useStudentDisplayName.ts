import { useContext } from "react";
import { isLanguage } from "iframe-rpc/src";
import { useIntl } from "react-intl";
import {
  AuthenticationContext,
  isFullyAuthenticated,
} from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { getStudentNickname } from "@/utilities/student-name";

export const useStudentDisplayName = (): string => {
  const authenticationContext = useContext(AuthenticationContext);

  const intl = useIntl();

  if (
    !authenticationContext ||
    authenticationContext.role !== UserRole.student ||
    !isFullyAuthenticated(authenticationContext)
  ) {
    throw new Error(
      "useStudentDisplayName can only be used in student authentication context",
    );
  }

  const locale = isLanguage(intl.locale) ? intl.locale : undefined;
  const pseudonym = authenticationContext.isAnonymous
    ? undefined
    : authenticationContext.pseudonym;

  return getStudentNickname(authenticationContext.studentId, pseudonym, locale);
};

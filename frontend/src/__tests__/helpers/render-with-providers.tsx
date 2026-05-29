import React from "react";
import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import {
  AdminOrTeacherAuthenticated,
  AuthenticationContext,
} from "@/contexts/AuthenticationContext";
import { UserRole } from "@/types/user/user-role";
import { ChakraProvider } from "@/components/ui/ChakraProvider";
import TeacherLongTermKeyPair from "@/utilities/crypto/TeacherLongTermKeyPair";

export const mockTeacherContext: AdminOrTeacherAuthenticated = {
  version: "2",
  idToken: "token",
  authenticationToken: "auth-token",
  userId: 1,
  name: "Teacher",
  email: "teacher@test.com",
  role: UserRole.teacher,
  keyPair: {} as unknown as TeacherLongTermKeyPair,
  keyPairId: 1,
};

export const mockAdminContext: AdminOrTeacherAuthenticated = {
  ...mockTeacherContext,
  role: UserRole.admin,
};

export const renderWithProviders = (
  ui: React.ReactElement,
  { role = UserRole.teacher, ...options } = {},
) => {
  const authContext =
    role === UserRole.admin ? mockAdminContext : mockTeacherContext;

  return render(
    <ChakraProvider>
      <IntlProvider locale="en" messages={{}}>
        <AuthenticationContext.Provider value={authContext}>
          {ui}
        </AuthenticationContext.Provider>
      </IntlProvider>
    </ChakraProvider>,
    options,
  );
};

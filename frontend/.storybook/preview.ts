import type { Preview } from "@storybook/react";
import { reactIntl } from "./reactIntl";
import {
  getAuthenticatedTeacherContext,
  getAuthenticatedNonStudentTeacherContext,
  getFullyAuthenticatedStudentContext,
  getLocallyAuthenticatedStudentContext,
  getUnauthenticatedContext,
} from "../src/contexts/__tests__/mock-contexts";
import { UserRole } from "../src/i18n/user-role-messages";

import "../src/styles/globals.scss";

const preview: Preview = {
  initialGlobals: {
    locale: reactIntl.defaultLocale,
    locales: {
      en: "English",
      fr: "Français",
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    reactIntl,
  },
  tags: ["autodocs"],
  loaders: [
    async () => ({
      authenticationContextTeacher: await getAuthenticatedTeacherContext(
        window.crypto.subtle,
      ),
      authenticationContextAdmin:
        await getAuthenticatedNonStudentTeacherContext(UserRole.admin)(),
      authenticationContextStudent: await getFullyAuthenticatedStudentContext(
        window.crypto.subtle,
      ),
      authenticationContextLocalStudent:
        await getLocallyAuthenticatedStudentContext(),
      authenticationContextUnauthenticated: await getUnauthenticatedContext(),
    }),
  ],
};

export default preview;

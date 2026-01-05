import type { Preview } from "@storybook/react";
import { reactIntl } from "./reactIntl";
import {
  getAuthenticatedTeacherContext,
  getAuthenticatedAdminContext,
  getFullyAuthenticatedStudentContext,
  getLocallyAuthenticatedStudentContext,
  getUnauthenticatedContext,
} from "../src/contexts/__tests__/mock-contexts";
import { ChakraProvider } from "../src/components/ui/ChakraProvider";
import { UserRole } from "../src/types/user/user-role";
import i18n from "storybook-i18n/preview";

import "../src/styles/globals.scss";
import { useGlobals } from "storybook/internal/preview-api";
import { IntlProvider } from "react-intl";

const i18nLoaders =
  i18n.loaders === undefined
    ? []
    : Array.isArray(i18n.loaders)
      ? i18n.loaders
      : [i18n.loaders];
const i18nDecorators =
  i18n.decorators === undefined
    ? []
    : Array.isArray(i18n.decorators)
      ? i18n.decorators
      : [i18n.decorators];

const preview: Preview = {
  initialGlobals: {
    ...i18n.initialGlobals,
    locale: reactIntl.defaultLocale,
    locales: {
      en: "English",
      fr: "Français",
    },
  },
  parameters: {
    ...i18n.parameters,
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
    ...i18nLoaders,
    async () => ({
      authenticationContextTeacher: await getAuthenticatedTeacherContext(
        window.crypto.subtle,
      ),
      authenticationContextAdmin: await getAuthenticatedAdminContext(
        UserRole.admin,
      )(window.crypto.subtle),
      authenticationContextStudent: await getFullyAuthenticatedStudentContext(
        window.crypto.subtle,
      ),
      authenticationContextLocalStudent:
        await getLocallyAuthenticatedStudentContext(),
      authenticationContextUnauthenticated: await getUnauthenticatedContext(),
    }),
  ],
  decorators: [
    ...i18nDecorators,
    (Story, { args }) => (
      <ChakraProvider>
        <Story {...args} />
      </ChakraProvider>
    ),
    (Story, context) => {
      const [{ locale }] = useGlobals();
      const {
        parameters: { reactIntl, locale: defaultLocale },
      } = context;
      const currentLocale = locale || defaultLocale;

      if (!currentLocale || !reactIntl) {
        throw new Error("No locale or react-intl defined in Storybook");
      }

      const { formats, messages, defaultRichTextElements, timeZone } =
        reactIntl;

      const safeFormats = formats ? formats[currentLocale] : undefined;
      if (!messages) {
        throw new Error("No messages defined for react-intl in Storybook");
      }
      
      return (
        <IntlProvider
          key={currentLocale}
          timeZone={timeZone}
          formats={safeFormats}
          messages={messages[currentLocale]}
          locale={currentLocale}
          defaultLocale={defaultLocale}
          defaultRichTextElements={defaultRichTextElements}
        >
          <Story {...context.args} />
        </IntlProvider>
      );
    },
  ],
};

export default preview;

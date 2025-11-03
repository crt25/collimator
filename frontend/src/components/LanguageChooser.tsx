import { useContext, useMemo } from "react";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import {
  allSupportedLocales,
  SupportedLocale,
  UpdateLocalizationContext,
} from "@/contexts/LocalizationContext";
import Dropdown, { DropdownItem } from "./Dropdown";

const messages = defineMessages({
  english: {
    id: "LanguageChooser.english",
    defaultMessage: "English",
  },
  french: {
    id: "LanguageChooser.french",
    defaultMessage: "Français",
  },
});

const languageMessageByLocale: {
  [locale in SupportedLocale]: MessageDescriptor;
} = {
  [SupportedLocale.english]: messages.english,
  [SupportedLocale.french]: messages.french,
};

const LanguageChooser = () => {
  const intl = useIntl();
  const { setState: setLocalizationState } = useContext(
    UpdateLocalizationContext,
  );

  const availableLocales = useMemo(
    () => [...allSupportedLocales].filter((locale) => locale !== intl.locale),
    [intl.locale],
  );

  return (
    <Dropdown
      trigger={intl.formatMessage(
        languageMessageByLocale[intl.locale as SupportedLocale],
      )}
    >
      {availableLocales.map((locale) => (
        <DropdownItem
          key={locale}
          onClick={() => setLocalizationState({ locale })}
        >
          {intl.formatMessage(languageMessageByLocale[locale])}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default LanguageChooser;

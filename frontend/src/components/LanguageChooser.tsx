import {
  allSupportedLocales,
  SupportedLocale,
  UpdateLocalizationContext,
} from "@/contexts/LocalizationContext";
import { useContext, useMemo } from "react";
import { Dropdown } from "react-bootstrap";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";

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
    <Dropdown>
      <Dropdown.Toggle>
        {intl.formatMessage(
          languageMessageByLocale[intl.locale as SupportedLocale],
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {availableLocales.map((locale) => (
          <Dropdown.Item
            key={locale}
            onClick={() => setLocalizationState({ locale })}
          >
            {intl.formatMessage(languageMessageByLocale[locale])}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageChooser;

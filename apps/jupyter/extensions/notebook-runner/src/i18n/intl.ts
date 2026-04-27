import {
  createIntl,
  createIntlCache,
  IntlShape,
  MessageDescriptor,
} from "react-intl";
import { MessageFormatElement } from "@formatjs/icu-messageformat-parser";
import { Language } from "../iframe-rpc/src";
import en from "../content/compiled-locales/en.json";
import fr from "../content/compiled-locales/fr.json";

type CompiledMessages = Record<string, MessageFormatElement[]>;

const messagesByLocale: Record<Language, CompiledMessages> = {
  [Language.en]: en as CompiledMessages,
  [Language.fr]: fr as CompiledMessages,
};

const cache = createIntlCache();

let intl: IntlShape = createIntl(
  { locale: Language.en, messages: messagesByLocale[Language.en] },
  cache,
);

export const setIntlLocale = (locale: Language): void => {
  intl = createIntl(
    {
      locale,
      messages: messagesByLocale[locale] ?? messagesByLocale[Language.en],
    },
    cache,
  );
};

export const formatMessage = (descriptor: MessageDescriptor): string =>
  intl.formatMessage(descriptor);

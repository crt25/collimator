import en from "../content/compiled-locales/en.json";
import fr from "../content/compiled-locales/fr.json";
const locales = ['en', 'fr'];

const messages = {
  en,
  fr,
};

const formats = {};

export const reactIntl = {
  defaultLocale: 'en',
  locales,
  messages,
  formats,
};

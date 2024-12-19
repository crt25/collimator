import fs from "fs";
import path from "path";

const defaultLocale = "en";
const defaultLocaleFilename = `${defaultLocale}.json`;

const __dirname = import.meta.dirname;
const localesDir = path.resolve(__dirname, "../content/locales");

const defaultMessages = JSON.parse(
  fs.readFileSync(path.resolve(localesDir, defaultLocaleFilename)),
);

const defaultMessagesKeys = Object.keys(defaultMessages);

const locales = fs
  .readdirSync(localesDir)
  .filter((n) => n !== defaultLocaleFilename);

for (const locale of locales) {
  const filename = path.resolve(localesDir, locale);

  let messages = JSON.parse(fs.readFileSync(filename));

  // only keep the keys present in the default locale
  messages = Object.fromEntries(
    defaultMessagesKeys.map((key) => [
      key,
      messages[key] || defaultMessages[key],
    ]),
  );

  fs.writeFileSync(filename, JSON.stringify(messages, undefined, 2));
}

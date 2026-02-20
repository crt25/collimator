import { uniqueNamesGenerator } from "unique-names-generator";
import animals, {
  AnimalLocale,
  animalLocales,
} from "../../content/dictionaries/animals";
import numbers from "../../content/dictionaries/numbers";

const defaultLocale: AnimalLocale = "en";

const getLocale = (locale: string): AnimalLocale => {
  return animalLocales.find((l) => locale.startsWith(l)) ?? defaultLocale;
};

export function getStudentNickname(
  studentId: number,
  pseudonym?: string | null,
  locale: string = "en",
): string {
  // We would prefer prefixing the pseudonym to avoid the two name spaces
  // from clashing.
  // However for backwards compatibility we don't, see https://github.com/crt25/collimator/pull/286/files#r2054086764.
  const seed = pseudonym ? pseudonym : `anonymous_${studentId}`;
  const localeKey = getLocale(locale);
  const animalNames = animals.map((animal) => animal[localeKey]);

  return uniqueNamesGenerator({
    dictionaries: [animalNames, numbers],
    separator: "-",
    length: 2,
    style: "lowerCase",
    seed,
  });
}

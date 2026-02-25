import { uniqueNamesGenerator } from "unique-names-generator";
import { Language } from "iframe-rpc-react/src";
import animals from "../../content/dictionaries/animals";
import numbers from "../../content/dictionaries/numbers";

export function getStudentNickname(
  studentId: number,
  pseudonym?: string | null,
  locale: Language = Language.en,
): string {
  // We would prefer prefixing the pseudonym to avoid the two name spaces
  // from clashing.
  // However for backwards compatibility we don't, see https://github.com/crt25/collimator/pull/286/files#r2054086764.
  const seed = pseudonym ? pseudonym : `anonymous_${studentId}`;
  const animalNames = animals.map((animal) => animal[locale]);

  return uniqueNamesGenerator({
    dictionaries: [animalNames, numbers],
    separator: "-",
    length: 2,
    style: "lowerCase",
    seed,
  });
}

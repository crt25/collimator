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
  return pseudonym ? pseudonym : generateAnonymousName(studentId, locale);
}

const generateAnonymousName = (studentId: number, locale: Language): string => {
  const animalIndex = studentId % animals.length;
  const numberIndex = studentId % numbers.length;

  return `${animals[animalIndex][locale]}-${numbers[numberIndex]}`;
};

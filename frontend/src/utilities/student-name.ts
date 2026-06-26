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
  const hash = hashString(seed);
  const animalIndex = hash % animals.length;
  const numberIndex = hash % numbers.length;

  return `${animals[animalIndex][locale]}-${numbers[numberIndex]}`;
}

// source: https://ssojet.com/hashing/bernsteins-hash-djb2-in-nodejs
const hashString = (input: string): number => {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) + hash + input.charCodeAt(i); /* hash * 33 + c */
  }
  return hash >>> 0; // Ensure unsigned 32-bit integer
};

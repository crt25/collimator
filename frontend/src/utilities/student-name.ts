import { Language } from "iframe-rpc-react/src";
import animals from "../../content/dictionaries/animals";
import numbers from "../../content/dictionaries/numbers";

export function getStudentNickname(
  studentId: number,
  locale: Language = Language.en,
): string {
  const animalIndex = studentId % animals.length;

  const hash = hashString(studentId.toString());
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

import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

export function getStudentNickname(pseudonym: string): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    length: 2,
    style: "capital",
    seed: pseudonym,
  });
}

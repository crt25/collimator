import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

export function getStudentNickname(
  studentId: number,
  pseudonym?: string | null,
): string {
  // We would prefer prefixing the pseudonym to avoid the two name spaces
  // from clashing.
  // However for backwards compatibility we don't, see https://github.com/crt25/collimator/pull/286/files#r2054086764.
  const seed = pseudonym ? pseudonym : `anonymous_${studentId}`;

  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    length: 2,
    style: "capital",
    seed,
  });
}

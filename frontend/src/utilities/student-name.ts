import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

export function getStudentNickname(
  studentId: number,
  pseudonym?: string | null,
): string {
  const seed = pseudonym ? `pseudonym_${pseudonym}` : `anonymous_${studentId}`;

  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    length: 2,
    style: "capital",
    seed,
  });
}

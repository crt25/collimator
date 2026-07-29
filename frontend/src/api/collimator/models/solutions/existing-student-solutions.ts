import { ExistingStudentSolutionDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ExistingSolution } from "./existing-solution";
import { ExistingSolutionTest } from "./existing-solution-test";

export class ExistingStudentSolution {
  readonly id: number;
  readonly sessionId: number;
  readonly studentId: number;
  readonly taskId: number;
  readonly createdAt: Date;
  readonly happenedAt: Date;
  readonly solution: ExistingSolution;
  readonly tests: ExistingSolutionTest[] = [];

  protected constructor({
    id,
    sessionId,
    studentId,
    taskId,
    createdAt,
    happenedAt,
    solution,
    tests,
  }: ClassProperties<ExistingStudentSolution>) {
    this.id = id;
    this.sessionId = sessionId;
    this.studentId = studentId;
    this.taskId = taskId;
    this.createdAt = createdAt;
    this.happenedAt = happenedAt;
    this.solution = solution;
    this.tests = tests;
  }

  static fromDto(dto: ExistingStudentSolutionDto): ExistingStudentSolution {
    return new ExistingStudentSolution({
      ...dto,
      createdAt: new Date(dto.createdAt),
      happenedAt: new Date(dto.happenedAt),
      solution: ExistingSolution.fromDto(dto.solution),
      tests: dto.tests.map(ExistingSolutionTest.fromDto),
    });
  }

  static findSolutionToDisplay(
    solutions?: ExistingStudentSolution[],
  ): ExistingStudentSolution | null {
    if (!solutions || solutions.length === 0) {
      return null;
    }

    return solutions.reduce((mostRecentSolution, solution) => {
      const happenedAtDifference =
        mostRecentSolution.happenedAt.getTime() - solution.happenedAt.getTime();

      if (happenedAtDifference !== 0) {
        return happenedAtDifference > 0 ? mostRecentSolution : solution;
      }

      // The id is unique, so it is enough to tie break when two client
      // timestamps are exactly the same
      return mostRecentSolution.id >= solution.id
        ? mostRecentSolution
        : solution;
    }, solutions[0]);
  }
}

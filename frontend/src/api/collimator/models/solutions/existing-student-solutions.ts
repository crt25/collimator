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
  readonly solution: ExistingSolution;
  readonly isReference: boolean;
  readonly tests: ExistingSolutionTest[] = [];

  protected constructor({
    id,
    sessionId,
    studentId,
    taskId,
    createdAt,
    solution,
    isReference,
    tests,
  }: ClassProperties<ExistingStudentSolution>) {
    this.id = id;
    this.sessionId = sessionId;
    this.studentId = studentId;
    this.taskId = taskId;
    this.createdAt = createdAt;
    this.solution = solution;
    this.isReference = isReference;
    this.tests = tests;
  }

  static fromDto(dto: ExistingStudentSolutionDto): ExistingStudentSolution {
    return new ExistingStudentSolution({
      ...dto,
      createdAt: new Date(dto.createdAt),
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

    return solutions.reduce(
      (mostRecentSolution, solution) =>
        mostRecentSolution.createdAt.getTime() >= solution.createdAt.getTime()
          ? mostRecentSolution
          : solution,
      solutions[0],
    );
  }
}

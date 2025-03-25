import { ExistingStudentSolutionDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ExistingSolution } from "./existing-solution";

export class ExistingStudentSolution {
  readonly id: number;
  readonly sessionId: number;
  readonly studentId: number;
  readonly taskId: number;
  readonly createdAt: Date;
  readonly solution: ExistingSolution;

  protected constructor({
    id,
    sessionId,
    studentId,
    taskId,
    createdAt,
    solution,
  }: ClassProperties<ExistingStudentSolution>) {
    this.id = id;
    this.sessionId = sessionId;
    this.studentId = studentId;
    this.taskId = taskId;
    this.createdAt = createdAt;
    this.solution = solution;
  }

  static fromDto(dto: ExistingStudentSolutionDto): ExistingStudentSolution {
    return new ExistingStudentSolution({
      ...dto,
      createdAt: new Date(dto.createdAt),
      solution: ExistingSolution.fromDto(dto.solution),
    });
  }

  static findSolutionToDisplay(
    solutions?: ExistingStudentSolution[],
  ): ExistingStudentSolution | null {
    if (!solutions) {
      return null;
    }

    const solutionsSortedByDate = solutions.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return solutionsSortedByDate[0];
  }
}

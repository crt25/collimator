import { ExistingSolutionDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingSolution {
  readonly id: number;
  readonly sessionId: number;
  readonly studentId: number;
  readonly taskId: number;
  readonly createdAt: Date;

  protected constructor({
    id,
    sessionId,
    studentId,
    taskId,
    createdAt,
  }: ClassProperties<ExistingSolution>) {
    this.id = id;
    this.sessionId = sessionId;
    this.studentId = studentId;
    this.taskId = taskId;
    this.createdAt = createdAt;
  }

  static fromDto(dto: ExistingSolutionDto): ExistingSolution {
    return new ExistingSolution({
      ...dto,
      createdAt: new Date(dto.createdAt),
    });
  }

  // TODO: define what solution is to be displayed. e.g. the latest solution that solves the task
  static findSolutionToDisplay(
    solutions?: ExistingSolution[],
  ): ExistingSolution | null {
    if (!solutions) {
      return null;
    }

    const solutionsSortedByDate = solutions.toSorted(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return solutionsSortedByDate[0];
  }
}

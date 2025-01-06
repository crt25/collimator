import { StudentSessionProgressDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ClassProperties } from "../class-properties";
import { StudentTaskProgress } from "./student-task-progress";

export class StudentSessionProgress {
  readonly id: number;
  readonly taskProgress: StudentTaskProgress[];

  protected constructor({
    id,
    taskProgress,
  }: ClassProperties<StudentSessionProgress>) {
    this.id = id;
    this.taskProgress = taskProgress;
  }

  static fromDto(dto: StudentSessionProgressDto): StudentSessionProgress {
    return new StudentSessionProgress({
      id: dto.id,
      taskProgress: fromDtos(StudentTaskProgress, dto.taskProgress),
    });
  }
}

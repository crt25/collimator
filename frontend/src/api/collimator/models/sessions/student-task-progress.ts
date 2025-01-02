import { StudentTaskProgressDto, TaskProgress } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class StudentTaskProgress {
  readonly id: number;
  readonly taskProgress: TaskProgress;

  protected constructor({
    id,
    taskProgress,
  }: ClassProperties<StudentTaskProgress>) {
    this.id = id;
    this.taskProgress = taskProgress;
  }

  static fromDto(dto: StudentTaskProgressDto): StudentTaskProgress {
    return new StudentTaskProgress(dto);
  }
}

import { ExistingTaskDto, TaskType } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingTask {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly type: TaskType;

  protected constructor({
    id,
    title,
    description,
    type,
  }: ClassProperties<ExistingTask>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
  }

  static fromDto(dto: ExistingTaskDto): ExistingTask {
    return new ExistingTask(dto);
  }
}

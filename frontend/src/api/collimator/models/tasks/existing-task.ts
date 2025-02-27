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

  equals(other?: ExistingTask): boolean {
    return (
      this.id === other?.id &&
      this.title === other.title &&
      this.description === other.description &&
      this.type === other.type
    );
  }

  static fromDto(dto: ExistingTaskDto): ExistingTask {
    return new ExistingTask(dto);
  }
}

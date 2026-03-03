import { ExistingTaskDto, TaskType } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingTask {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly type: TaskType;
  readonly creatorId: number;
  readonly isPublic: boolean;
  readonly isInUse: boolean;

  protected constructor({
    id,
    title,
    description,
    type,
    creatorId,
    isPublic,
    isInUse,
  }: ClassProperties<ExistingTask>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.type = type;
    this.creatorId = creatorId;
    this.isPublic = isPublic;
    this.isInUse = isInUse;
  }

  equals(other?: ExistingTask): boolean {
    return (
      this.id === other?.id &&
      this.title === other.title &&
      this.description === other.description &&
      this.type === other.type &&
      this.creatorId === other.creatorId &&
      this.isPublic === other.isPublic &&
      this.isInUse === other.isInUse
    );
  }

  static fromDto(dto: ExistingTaskDto): ExistingTask {
    return new ExistingTask(dto);
  }
}

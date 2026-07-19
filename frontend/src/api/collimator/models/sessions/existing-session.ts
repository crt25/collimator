import { ExistingSessionDto, SessionStatus } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingSession {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly isAnonymous: boolean;
  readonly createdAt: string;
  readonly status: SessionStatus;
  readonly taskIds: number[];

  protected constructor({
    id,
    title,
    description,
    isAnonymous,
    createdAt,
    status,
    taskIds,
  }: ClassProperties<ExistingSession>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isAnonymous = isAnonymous;
    this.createdAt = createdAt;
    this.status = status;
    this.taskIds = taskIds;
  }

  static fromDto(dto: ExistingSessionDto): ExistingSession {
    return new ExistingSession({
      ...dto,
      taskIds: dto.tasks,
    });
  }
}

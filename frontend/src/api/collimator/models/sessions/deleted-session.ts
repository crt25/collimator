import { DeletedSessionDto, SessionStatus } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { SessionLesson } from "./session-lesson";

export class DeletedSession {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly isAnonymous: boolean;
  readonly createdAt: string;
  readonly lesson: SessionLesson | null;
  readonly status: SessionStatus;
  readonly taskIds: number[];

  protected constructor({
    id,
    title,
    description,
    isAnonymous,
    createdAt,
    lesson,
    status,
    taskIds,
  }: ClassProperties<DeletedSession>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isAnonymous = isAnonymous;
    this.createdAt = createdAt;
    this.lesson = lesson;
    this.status = status;
    this.taskIds = taskIds;
  }

  static fromDto(dto: DeletedSessionDto): DeletedSession {
    return new DeletedSession({
      ...dto,
      taskIds: dto.tasks,
      lesson: dto.lesson ? SessionLesson.fromDto(dto.lesson) : null,
    });
  }
}

import {
  ExistingSessionExtendedDto,
  SessionStatus,
} from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { SessionClass } from "./session-class";
import { SessionLesson } from "./session-lesson";
import { SessionTask } from "./session-task";

export class ExistingSessionExtended {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly isAnonymous: boolean;
  readonly createdAt: string;
  readonly klass: SessionClass;
  readonly lesson: SessionLesson | null;
  readonly status: SessionStatus;
  readonly tasks: SessionTask[];

  protected constructor({
    id,
    title,
    description,
    isAnonymous,
    createdAt,
    klass,
    lesson,
    status,
    tasks,
  }: ClassProperties<ExistingSessionExtended>) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.isAnonymous = isAnonymous;
    this.createdAt = createdAt;
    this.klass = klass;
    this.lesson = lesson;
    this.status = status;
    this.tasks = tasks;
  }

  equals(other?: ExistingSessionExtended): boolean {
    return (
      this.id === other?.id &&
      this.title === other.title &&
      this.description === other.description &&
      this.isAnonymous === other.isAnonymous &&
      this.createdAt === other.createdAt &&
      this.klass.equals(other.klass) &&
      (this.lesson == other.lesson ||
        this.lesson?.equals(other.lesson ?? undefined) === true) &&
      this.status === other.status &&
      this.tasks.length === other.tasks.length &&
      this.tasks.every((task, idx) => task.equals(other.tasks[idx]))
    );
  }

  static fromDto(dto: ExistingSessionExtendedDto): ExistingSessionExtended {
    return new ExistingSessionExtended({
      ...dto,
      tasks: dto.tasks.map(SessionTask.fromDto),
      klass: SessionClass.fromDto(dto.class),
      lesson: dto.lesson ? SessionLesson.fromDto(dto.lesson) : null,
    });
  }
}

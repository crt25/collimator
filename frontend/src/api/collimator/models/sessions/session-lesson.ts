import { SessionLessonDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class SessionLesson {
  readonly id: number;
  readonly name: string;

  protected constructor({ id, name }: ClassProperties<SessionLesson>) {
    this.id = id;
    this.name = name;
  }

  static fromDto(dto: SessionLessonDto): SessionLesson {
    return new SessionLesson(dto);
  }
}

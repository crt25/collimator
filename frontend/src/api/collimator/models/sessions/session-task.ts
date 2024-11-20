import { SessionTaskDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class SessionTask {
  readonly id: number;
  readonly title: string;

  protected constructor({ id, title }: ClassProperties<SessionTask>) {
    this.id = id;
    this.title = title;
  }

  static fromDto(dto: SessionTaskDto): SessionTask {
    return new SessionTask(dto);
  }
}

import { SessionClassDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class SessionClass {
  readonly id: number;
  readonly name: string;

  protected constructor({ id, name }: ClassProperties<SessionClass>) {
    this.id = id;
    this.name = name;
  }

  equals(other?: SessionClass): boolean {
    return this.id === other?.id && this.name === other.name;
  }

  static fromDto(dto: SessionClassDto): SessionClass {
    return new SessionClass(dto);
  }
}

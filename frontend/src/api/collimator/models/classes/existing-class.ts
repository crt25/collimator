import { ExistingClassDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingClass {
  readonly id: number;
  readonly name: string;
  readonly teacherId: number;

  protected constructor({
    id,
    name,
    teacherId,
  }: ClassProperties<ExistingClass>) {
    this.id = id;
    this.name = name;
    this.teacherId = teacherId;
  }

  static fromDto(dto: ExistingClassDto): ExistingClass {
    return new ExistingClass({
      id: dto.id,
      name: dto.name,
      teacherId: dto.teacherId,
    });
  }
}

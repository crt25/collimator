import { ClassTeacherDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ClassTeacher {
  readonly id: number;
  readonly name: string | null;

  protected constructor({ id, name }: ClassProperties<ClassTeacher>) {
    this.id = id;
    this.name = name;
  }

  static fromDto(dto: ClassTeacherDto): ClassTeacher {
    return new ClassTeacher({
      id: dto.id,
      name: dto.name,
    });
  }
}

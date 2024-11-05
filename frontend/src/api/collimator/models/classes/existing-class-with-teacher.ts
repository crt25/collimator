import { ExistingClassWithTeacherDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ExistingClass } from "./existing-class";
import { ExistingClassExtendedTeacher } from "./existing-class-extended-teacher";

export class ExistingClassWithTeacher extends ExistingClass {
  readonly teacher: ExistingClassExtendedTeacher;

  protected constructor({
    id,
    name,
    teacherId,
    teacher,
  }: ClassProperties<ExistingClassWithTeacher>) {
    super({ id, name, teacherId });

    this.teacher = teacher;
  }

  static fromDto(dto: ExistingClassWithTeacherDto): ExistingClassWithTeacher {
    return new ExistingClassWithTeacher({
      id: dto.id,
      name: dto.name,
      teacherId: dto.teacherId,
      teacher: ExistingClassExtendedTeacher.fromDto(dto.teacher),
    });
  }
}

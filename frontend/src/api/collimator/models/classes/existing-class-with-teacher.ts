import { ExistingClassWithTeacherDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ExistingClass } from "./existing-class";
import { ClassTeacher } from "./existing-class-extended-teacher";

export class ExistingClassWithTeacher extends ExistingClass {
  readonly teacher: ClassTeacher;

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
    const teacher = ClassTeacher.fromDto(dto.teacher);

    return new ExistingClassWithTeacher({
      ...dto,
      teacherId: teacher.id,
      teacher,
    });
  }
}

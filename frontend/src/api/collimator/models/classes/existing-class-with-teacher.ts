import { ExistingClassWithTeacherDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ClassTeacher } from "./existing-class-extended-teacher";

export class ExistingClassWithTeacher {
  readonly id: number;
  readonly name: string;
  readonly teacher: ClassTeacher;

  protected constructor({
    id,
    name,
    teacher,
  }: ClassProperties<ExistingClassWithTeacher>) {
    this.id = id;
    this.name = name;
    this.teacher = teacher;
  }

  static fromDto(dto: ExistingClassWithTeacherDto): ExistingClassWithTeacher {
    const teacher = ClassTeacher.fromDto(dto.teacher);

    return new ExistingClassWithTeacher({
      ...dto,
      teacher,
    });
  }
}

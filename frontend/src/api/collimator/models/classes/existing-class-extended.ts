import { ExistingClassExtendedDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ClassProperties } from "../class-properties";
import { ClassStudent } from "./class-student";
import { ClassTeacher } from "./class-teacher";
import { ExistingClassWithTeacher } from "./existing-class-with-teacher";

export class ExistingClassExtended extends ExistingClassWithTeacher {
  readonly sessions: number[];
  readonly students: ClassStudent[];

  protected constructor({
    id,
    name,
    sessions,
    students,
    teacher,
  }: ClassProperties<ExistingClassExtended>) {
    super({ id, name, teacher });

    this.sessions = sessions;
    this.students = students;
  }

  static fromDto(dto: ExistingClassExtendedDto): ExistingClassExtended {
    const teacher = ClassTeacher.fromDto(dto.teacher);
    const students: ClassStudent[] = fromDtos(ClassStudent, dto.students);

    return new ExistingClassExtended({
      ...dto,
      teacher,
      students,
    });
  }
}

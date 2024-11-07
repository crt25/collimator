import { ExistingClassExtendedDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";
import { ClassTeacher } from "./existing-class-extended-teacher";
import { ExistingClassWithTeacher } from "./existing-class-with-teacher";

export class ExistingClassExtended extends ExistingClassWithTeacher {
  readonly sessions: number[];
  readonly studentCount: number;

  protected constructor({
    id,
    name,
    sessions,
    studentCount,
    teacher,
  }: ClassProperties<ExistingClassExtended>) {
    super({ id, name, teacher });

    this.sessions = sessions;
    this.studentCount = studentCount;
  }

  static fromDto(dto: ExistingClassExtendedDto): ExistingClassExtended {
    const teacher = ClassTeacher.fromDto(dto.teacher);

    return new ExistingClassExtended({
      ...dto,
      teacher,
    });
  }
}

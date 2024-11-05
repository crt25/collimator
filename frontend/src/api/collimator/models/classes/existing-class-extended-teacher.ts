import { ExistingClassExtendedDtoTeacher } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ExistingClassExtendedTeacher {
  protected constructor({}: ClassProperties<ExistingClassExtendedTeacher>) {}

  static fromDto(
    _dto: ExistingClassExtendedDtoTeacher,
  ): ExistingClassExtendedTeacher {
    return new ExistingClassExtendedTeacher({});
  }
}

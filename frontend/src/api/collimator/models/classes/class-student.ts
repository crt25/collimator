import { ClassStudentDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class ClassStudent {
  readonly id: number;
  readonly pseudonym: string;

  protected constructor({ id, pseudonym }: ClassProperties<ClassStudent>) {
    this.id = id;
    this.pseudonym = pseudonym;
  }

  static fromDto(dto: ClassStudentDto): ClassStudent {
    return new ClassStudent(dto);
  }
}

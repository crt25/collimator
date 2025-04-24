import { ClassStudentDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export type StudentIdentity = {
  longTermIdentifier: string;
  name: string;
};

export class ClassStudent {
  readonly studentId: number;
  readonly pseudonym: string;
  readonly keyPairId: number | null;

  protected constructor({
    studentId,
    pseudonym,
    keyPairId,
  }: ClassProperties<ClassStudent>) {
    this.studentId = studentId;
    this.pseudonym = pseudonym;
    this.keyPairId = keyPairId;
  }

  static fromDto(dto: ClassStudentDto): ClassStudent {
    return new ClassStudent(dto);
  }
}

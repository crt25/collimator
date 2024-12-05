import { ClassStudentDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export type StudentIdentity = {
  longTermIdentifier: string | null;
  name: string;
};

export class ClassStudent {
  readonly id: number;
  readonly pseudonym: string;
  readonly keyPairId: number | null;

  protected constructor({
    id,
    pseudonym,
    keyPairId,
  }: ClassProperties<ClassStudent>) {
    this.id = id;
    this.pseudonym = pseudonym;
    this.keyPairId = keyPairId;
  }

  static fromDto(dto: ClassStudentDto): ClassStudent {
    return new ClassStudent(dto);
  }
}

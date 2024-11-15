import { ClassStudentDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export type StudentIdentity = {
  longTermIdentity: string;
  name: string;
};

export class ClassStudent {
  readonly id: number;
  readonly pseudonym: string;
  readonly publicKeyId?: number;

  protected constructor({
    id,
    pseudonym,
    publicKeyId,
  }: ClassProperties<ClassStudent>) {
    this.id = id;
    this.pseudonym = pseudonym;
    this.publicKeyId = publicKeyId;
  }

  static fromDto(dto: ClassStudentDto): ClassStudent {
    return new ClassStudent(dto);
  }
}

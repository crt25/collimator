import { SessionStudentDto } from "../../generated/models";
import { ClassProperties } from "../class-properties";

export class SessionStudent {
  readonly studentId: number;
  /**
   * Null for a student participating anonymously - an anonymous participant
   * is never resolved to an identity (CRT-439).
   */
  readonly pseudonym: string | null;
  readonly keyPairId: number | null;

  protected constructor({
    studentId,
    pseudonym,
    keyPairId,
  }: ClassProperties<SessionStudent>) {
    this.studentId = studentId;
    this.pseudonym = pseudonym;
    this.keyPairId = keyPairId;
  }

  equals(other?: SessionStudent): boolean {
    return (
      this.studentId === other?.studentId &&
      this.pseudonym === other.pseudonym &&
      this.keyPairId === other.keyPairId
    );
  }

  static fromDto(dto: SessionStudentDto): SessionStudent {
    return new SessionStudent(dto);
  }
}

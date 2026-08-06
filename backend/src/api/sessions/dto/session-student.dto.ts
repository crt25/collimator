import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { SessionStudent } from "../sessions.service";

export class SessionStudentDto {
  @ApiProperty({
    example: 1,
    description: "The unique identifier of a student.",
  })
  @Expose()
  readonly studentId!: number;

  @ApiProperty({
    example: 1,
    description:
      "The unique identifier of the key pair used to encrypt the student's" +
      " pseudonym. Null for a student participating anonymously.",
    nullable: true,
    type: "number",
  })
  @Expose()
  readonly keyPairId!: number | null;

  @ApiProperty({
    example: "John Doe",
    description:
      "The pseudonym of the student. Null for a student participating" +
      " anonymously - an anonymous participant is never resolved to an" +
      " identity.",
    nullable: true,
    type: "string",
  })
  @Transform(
    ({ obj: { pseudonym } }: { obj: SessionStudent }) =>
      pseudonym === null ? null : Buffer.from(pseudonym).toString("base64"),
    {
      toClassOnly: true,
    },
  )
  @Expose()
  readonly pseudonym!: string | null;
}

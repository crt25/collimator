import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { ClassExtended } from "../classes.service";

export class ClassStudentDto {
  @ApiProperty({
    example: 1,
    description: "The unique identifier of a student.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: 1,
    description:
      "The unique identifier of the key pair used to encrypt the student's pseudonym.",
    nullable: true,
    type: "number",
  })
  @Expose()
  readonly keyPairId!: number | null;

  @ApiProperty({
    example: "John Doe",
    description: "The pseudonym of the student",
    type: "string",
  })
  @Transform(
    ({ obj: { pseudonym } }: { obj: ClassExtended["students"][0] }) =>
      Buffer.from(pseudonym).toString("base64"),
    {
      toClassOnly: true,
    },
  )
  @Expose()
  readonly pseudonym!: string;
}

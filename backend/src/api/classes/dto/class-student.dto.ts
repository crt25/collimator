import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";
import { ClassExtended } from "../classes.service";

export class ClassStudentDto {
  @ApiProperty({
    example: 1,
    description: "The unique identifier of a student.",
  })
  @Expose()
  readonly studentId!: number;

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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;
}

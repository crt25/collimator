import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ClassStudentDto {
  @ApiProperty({
    example: 1,
    description: "The id of a student in a class.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "John Doe",
    description: "The pseudonym of the student",
    type: "string",
  })
  @Expose()
  readonly pseudonym!: string;
}

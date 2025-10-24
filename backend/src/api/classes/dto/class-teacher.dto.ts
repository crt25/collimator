import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDate } from "class-validator";

export class ClassTeacherDto {
  @ApiProperty({
    example: 1,
    description: "The id of a class's teacher.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "John Doe",
    description: "The name of the class's teacher.",
    nullable: true,
    type: "string",
  })
  @Expose()
  readonly name!: string | null;

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;
}

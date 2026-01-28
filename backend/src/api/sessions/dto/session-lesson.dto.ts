import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class SessionLessonDto {
  @ApiProperty({
    example: 1,
    description: "The id of a lesson.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "Scratch: Introduction to Loops",
    description: "The name of the lesson.",
    type: "string",
  })
  @Expose()
  readonly name!: string | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;
}

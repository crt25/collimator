import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

export class SessionTaskDto {
  @ApiProperty({
    example: 1,
    description: "The id of a task.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "Scratch: Introduction to Loops 1",
    description: "The title of the task.",
    type: "string",
  })
  @Expose()
  readonly title!: string | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;
}

import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDate } from "class-validator";

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

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;
}

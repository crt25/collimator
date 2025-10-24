import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsDate } from "class-validator";

export class SessionClassDto {
  @ApiProperty({
    example: 1,
    description: "The id of a class.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: "CS 101",
    description: "The name of the class.",
    type: "string",
  })
  @Expose()
  readonly name!: string | null;

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;
}

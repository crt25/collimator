import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";

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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;
}

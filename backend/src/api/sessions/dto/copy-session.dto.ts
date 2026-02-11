import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsPositive } from "class-validator";
import { Expose } from "class-transformer";

export class CopySessionDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @ApiProperty({
    description: "The ID of the session to copy from.",
    example: 1,
  })
  @Expose()
  readonly sourceSessionId!: number;
}

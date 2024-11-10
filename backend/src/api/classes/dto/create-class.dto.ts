import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt } from "class-validator";
import { Expose } from "class-transformer";

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly name!: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly teacherId!: number;
}

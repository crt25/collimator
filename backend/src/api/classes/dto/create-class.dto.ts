import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsInt,
  MaxLength,
  MinLength,
} from "class-validator";
import { Expose } from "class-transformer";

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty()
  @Expose()
  readonly name!: string;

  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly teacherId!: number;
}

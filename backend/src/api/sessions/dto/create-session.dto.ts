import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { Expose } from "class-transformer";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty()
  @Expose()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  @ApiProperty()
  @Expose()
  readonly description!: string;

  @IsBoolean()
  @ApiProperty()
  @Expose()
  readonly isAnonymous!: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  @ApiProperty({
    type: [Number],
  })
  @Expose()
  readonly taskIds!: number[];
}

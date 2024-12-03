import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { Expose } from "class-transformer";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
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

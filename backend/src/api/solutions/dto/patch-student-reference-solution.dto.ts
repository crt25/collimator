import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  Matches,
} from "class-validator";

export class PatchStudentReferenceSolutionDto {
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty()
  @Expose()
  readonly isReference!: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    each: true,
    message: "each solution hash must be base64url encoded",
  })
  @ApiProperty({
    type: [String],
    example: ["dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl"],
    description:
      "The base64url-encoded hashes of the solutions to star or unstar.",
  })
  @Expose()
  readonly solutionHashes!: string[];
}

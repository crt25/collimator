import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsString,
  Matches,
} from "class-validator";

export const maxSolutionHashesPerRequest = 100;

export class PatchStudentReferenceSolutionDto {
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty()
  @Expose()
  readonly isReference!: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(maxSolutionHashesPerRequest)
  @IsString({ each: true })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    each: true,
    message: "each solution hash must be base64url encoded",
  })
  @ApiProperty({
    type: [String],
    maxItems: maxSolutionHashesPerRequest,
    example: ["dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl"],
    description:
      "The base64url-encoded hashes of the solutions to star or unstar.",
  })
  @Expose()
  readonly solutionHashes!: string[];
}

import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsBoolean, IsString } from "class-validator";

export class PatchStudentReferenceSolutionDto {
  @Type(() => Boolean)
  @IsBoolean()
  @ApiProperty()
  @Expose()
  readonly isReference!: boolean;

  @IsString()
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description:
      "The base64url-encoded hash of the solution to star or unstar.",
  })
  @Expose()
  readonly solutionHash!: string;
}

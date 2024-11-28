import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, Min } from "class-validator";
import { IsAtMost } from "src/api/validators/is-at-most";

export class CreateSolutionDto {
  // converts the input to a number - necessary because of the multipart/form-data
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @Min(0)
  @ApiProperty({
    example: 12,
    description: "The total number of tests. Must be a positive integer.",
  })
  readonly totalTests!: number;

  // converts the input to a number - necessary because of the multipart/form-data
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @Min(0)
  @IsAtMost("totalTests")
  @ApiProperty({
    example: 10,
    description:
      "The number of the tests that passed. Must be a positive integer and smaller than or equal to totalTests.",
  })
  readonly passedTests!: number;

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Solution file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}

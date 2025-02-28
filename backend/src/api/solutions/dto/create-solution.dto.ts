import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray } from "class-validator";
import { SolutionTestDto } from "./solution-test.dto";

export class CreateSolutionDto {
  @Type(() => SolutionTestDto)
  @IsArray()
  @ApiProperty({
    description: "The tests that were run for the solution.",
  })
  readonly tests!: SolutionTestDto[];

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Solution file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}

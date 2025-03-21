import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray } from "class-validator";
import { CreateSolutionTestDto } from "./create-solution-test.dto";

export class CreateSolutionDto {
  @Type(() => CreateSolutionTestDto)
  @IsArray()
  @ApiProperty({
    description: "The tests that were run for the solution.",
    type: [CreateSolutionTestDto],
  })
  readonly tests!: CreateSolutionTestDto[];

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Solution file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}

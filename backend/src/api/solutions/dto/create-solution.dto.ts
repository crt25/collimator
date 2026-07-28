import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDate } from "class-validator";
import { IsClientTimestamp } from "src/utilities/validation/client-timestamp";
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

  @Type(() => Date)
  @IsDate()
  @IsClientTimestamp()
  @ApiProperty({
    example: "2025-01-01T12:00:00Z",
    description:
      "Client timestamp of the solution submission. May differ from the server-side createdAt.",
  })
  readonly happenedAt!: Date;
}

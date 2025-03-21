import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { CreateSolutionTestDto } from "src/api/solutions/dto/create-solution-test.dto";

export class CreateReferenceSolutionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly description!: string;

  @Type(() => CreateSolutionTestDto)
  @IsArray()
  @ApiProperty({
    description: "The tests that were run for the solution.",
    type: [CreateSolutionTestDto],
  })
  readonly tests!: CreateSolutionTestDto[];
}

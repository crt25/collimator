import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  MaxLength,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ReferenceSolutionId } from "src/api/solutions/dto/existing-reference-solution.dto";
import { CreateSolutionTestDto } from "src/api/solutions/dto/create-solution-test.dto";

export class UpdateReferenceSolutionDto {
  @ApiProperty({
    example: 318,
    description:
      "The reference solutions's unique identifier, a positive integer.",
    nullable: true,
    type: "number",
  })
  @IsOptional()
  @IsNumber()
  readonly id!: ReferenceSolutionId | null;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  @ApiProperty()
  readonly description!: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  readonly isInitial!: boolean;

  @Type(() => CreateSolutionTestDto)
  @IsArray()
  @ApiProperty({
    description: "The tests that were run for the solution.",
    type: [CreateSolutionTestDto],
  })
  readonly tests!: CreateSolutionTestDto[];
}

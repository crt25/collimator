import { ApiProperty } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { CreateSolutionTestDto } from "./create-solution-test.dto";
import { StudentSolutionId } from "./existing-student-solution.dto";
import { ReferenceSolutionId } from "./existing-reference-solution.dto";

export type TestId = number;

export class ExistingSolutionTestDto extends CreateSolutionTestDto {
  @ApiProperty({
    example: 318,
    description: "The solution's unique identifier, a positive integer.",
  })
  readonly id!: TestId;

  @ApiProperty({
    example: 318,
    description: "The id of the associated reference solution.",
  })
  readonly referenceSolutionId!: ReferenceSolutionId;

  @ApiProperty({
    example: 318,
    description: "The id of the associated student solution.",
  })
  readonly studentSolutionId!: StudentSolutionId;

  static fromQueryResult(data: SolutionTest): ExistingSolutionTestDto {
    return plainToInstance(ExistingSolutionTestDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

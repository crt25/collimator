import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Type } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { IsDate, IsOptional } from "class-validator";
import { CreateSolutionTestDto } from "./create-solution-test.dto";
import { StudentSolutionId } from "./existing-student-solution.dto";
import { ReferenceSolutionId } from "./existing-reference-solution.dto";

export type TestId = number;

export class ExistingSolutionTestDto extends CreateSolutionTestDto {
  @ApiProperty({
    example: 318,
    description: "The solution's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: TestId;

  @ApiProperty({
    example: 318,
    description: "The id of the associated reference solution.",
    nullable: true,
  })
  readonly referenceSolutionId!: ReferenceSolutionId | null;

  @ApiProperty({
    example: 318,
    description: "The id of the associated student solution.",
    nullable: true,
  })
  readonly studentSolutionId!: StudentSolutionId | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;

  static fromQueryResult(data: SolutionTest): ExistingSolutionTestDto {
    return plainToInstance(ExistingSolutionTestDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

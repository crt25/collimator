import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { ReferenceAnalysis } from "../solutions.service";
import { CurrentAnalysisDto } from "./current-analysis.dto";
import { ReferenceSolutionId } from "./existing-reference-solution.dto";

export class ReferenceAnalysisDto
  extends CurrentAnalysisDto
  implements Modify<ReferenceAnalysis, { solutionHash: string }>
{
  @ApiProperty({
    example: "A solution failing all tests",
    description: "The title of the reference solution",
  })
  @Expose()
  readonly title!: string;

  @ApiProperty({
    example:
      "This solution is expected to fail all tests. It is simply equal to the original task.",
    description: "The description of the reference solution",
  })
  @Expose()
  readonly description!: string;

  @ApiProperty({
    example: 318,
    description:
      "The reference solutions's unique identifier, a positive integer.",
    nullable: false,
  })
  @Expose()
  readonly referenceSolutionId!: ReferenceSolutionId;

  static fromQueryResult(data: ReferenceAnalysis): ReferenceAnalysisDto {
    return plainToInstance(ReferenceAnalysisDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

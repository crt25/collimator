import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";

export class CurrentAnalysisDto {
  @ApiProperty({
    example: 318,
    description: "The analysis's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    example: 318,
    description: "The analysis's unique identifier, a positive integer.",
  })
  @Expose()
  readonly solutionId!: number;

  @ApiProperty({
    description: "The generalized AST of the solution.",
  })
  @Expose()
  readonly genericAst!: string;

  static fromQueryResult(data: CurrentAnalysisDto): CurrentAnalysisDto {
    return plainToInstance(CurrentAnalysisDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

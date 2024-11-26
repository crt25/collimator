import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";

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
    example: "John Doe",
    description: "The pseudonym of the student",
    type: "string",
  })
  @Transform(({ value }: { value: Buffer }) => value.toString("base64"), {
    toClassOnly: true,
  })
  @Expose()
  readonly studentPseudonym!: string;

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

import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { CurrentAnalysis } from "../solutions.service";

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
    example: 12,
    description: "The total number of tests.",
  })
  @Expose()
  readonly totalTests!: number;

  @ApiProperty({
    example: 10,
    description: "The number of passed tests.",
  })
  @Expose()
  readonly passedTests!: number;

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
    example: 1,
    description:
      "The unique identifier of the key pair used to encrypt the student's pseudonym.",
    nullable: true,
    type: "number",
  })
  @Expose()
  readonly studentKeyPairId!: number | null;

  @ApiProperty({
    description: "The generalized AST of the solution.",
  })
  @Expose()
  readonly genericAst!: string;

  static fromQueryResult(data: CurrentAnalysis): CurrentAnalysisDto {
    return plainToInstance(CurrentAnalysisDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

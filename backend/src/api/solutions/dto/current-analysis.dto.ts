import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { CurrentAnalysis } from "../solutions.service";
import { SolutionTestDto } from "./solution-test.dto";

type TestList = Omit<SolutionTest, "id">[];

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
    name: "tests",
    description: "The tests for the current analysis.",
    type: [SolutionTestDto],
  })
  @Transform(
    ({ value }: { value: TestList }) =>
      value?.map((test) =>
        plainToInstance(SolutionTestDto, test, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly tests!: SolutionTestDto[];

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

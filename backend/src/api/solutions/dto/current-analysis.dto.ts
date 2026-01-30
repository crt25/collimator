import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { AstVersion, SolutionTest } from "@prisma/client";
import { Modify } from "src/utilities/modify";
import { IsDate, IsOptional } from "class-validator";
import { AnalysisWithoutId } from "../solutions.service";
import { ExistingSolutionTestDto } from "./existing-solution-test.dto";

type TestList = Omit<SolutionTest, "id">[];

export abstract class CurrentAnalysisDto
  implements Modify<AnalysisWithoutId, { solutionHash: string }>
{
  @ApiProperty({
    example: 318,
    description: "The task id the analysis is associated with.",
  })
  @Expose()
  readonly taskId!: number;

  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded solution hash.",
  })
  @Transform(
    ({ obj: { solutionHash } }: { obj: AnalysisWithoutId }) =>
      Buffer.from(solutionHash).toString("base64url"),
    { toClassOnly: true },
  )
  @Expose()
  readonly solutionHash!: string;

  @ApiProperty({
    example: "true",
    description: "Whether this solution is marked as a reference solution.",
    type: "boolean",
  })
  @Expose()
  readonly isReferenceSolution!: boolean;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;

  @ApiProperty({
    name: "tests",
    description: "The tests for the current analysis.",
    type: [ExistingSolutionTestDto],
  })
  @Transform(
    ({ value }: { value: TestList }) =>
      value?.map((test) =>
        plainToInstance(ExistingSolutionTestDto, test, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly tests!: ExistingSolutionTestDto[];

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
    description: "The version of the AST.",
  })
  readonly astVersion!: AstVersion;

  @ApiProperty({
    description: "The generalized AST of the solution.",
  })
  @Expose()
  readonly genericAst!: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { Modify } from "src/utilities/modify";
import { ReferenceSolutionWithoutData } from "../solutions.service";
import { ExistingSolutionTestDto } from "./existing-solution-test.dto";
import { ExistingSolutionDto } from "./existing-solution.dto";

export type ReferenceSolutionId = number;
type TestList = Omit<SolutionTest, "id">[];

export class ExistingReferenceSolutionDto
  implements
    Modify<
      ReferenceSolutionWithoutData,
      {
        solutionHash: string;
        solution: ExistingSolutionDto;
      }
    >
{
  @ApiProperty({
    example: 318,
    description: "The solution's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: ReferenceSolutionId;

  @ApiProperty({
    description: "The solution's title.",
  })
  @Expose()
  readonly title!: string;

  @ApiProperty({
    description: "The solution's description.",
  })
  @Expose()
  readonly description!: string;

  @ApiProperty({
    description:
      "Whether this reference solution is the task's initial solution.",
  })
  @Expose()
  readonly isInitial!: boolean;

  @ApiProperty()
  readonly taskId!: number;

  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded solution hash.",
  })
  @Transform(
    ({ obj: { solutionHash } }: { obj: ReferenceSolutionWithoutData }) =>
      Buffer.from(solutionHash).toString("base64url"),
    { toClassOnly: true },
  )
  solutionHash!: string;

  @ApiProperty({
    description: "The associated solution.",
  })
  @Type(() => ExistingSolutionDto)
  @Expose()
  readonly solution!: ExistingSolutionDto;

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

  static fromQueryResult(
    data: ReferenceSolutionWithoutData,
  ): ExistingReferenceSolutionDto {
    return plainToInstance(ExistingReferenceSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

import { ApiProperty } from "@nestjs/swagger";
import {
  Exclude,
  Expose,
  plainToInstance,
  Transform,
  Type,
} from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { SolutionWithoutData } from "../solutions.service";
import { SolutionTestDto } from "./solution-test.dto";

export type SolutionId = number;
type TestList = Omit<SolutionTest, "id">[];

export class ExistingSolutionDto implements SolutionWithoutData {
  @ApiProperty({
    example: 318,
    description: "The solution's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: SolutionId;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  @ApiProperty()
  @Expose()
  readonly studentId!: number;

  @ApiProperty()
  @Expose()
  readonly sessionId!: number;

  @ApiProperty()
  @Expose()
  readonly taskId!: number;

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

  @Exclude()
  readonly mimeType!: string;

  @Exclude()
  readonly failedAnalyses!: number;

  static fromQueryResult(data: SolutionWithoutData): ExistingSolutionDto {
    return plainToInstance(ExistingSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

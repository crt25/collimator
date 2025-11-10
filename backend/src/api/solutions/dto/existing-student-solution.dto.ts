import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { SolutionTest } from "@prisma/client";
import { Modify } from "src/utilities/modify";
import { IsDate } from "class-validator";
import { StudentSolutionWithoutData } from "../solutions.service";
import { ExistingSolutionTestDto } from "./existing-solution-test.dto";
import { ExistingSolutionDto } from "./existing-solution.dto";

export type StudentSolutionId = number;
type TestList = Omit<SolutionTest, "id">[];

export class ExistingStudentSolutionDto
  implements
    Modify<
      StudentSolutionWithoutData,
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
  readonly id!: StudentSolutionId;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  @ApiProperty({
    example: "true",
    description: "Whether this solution is marked as a reference solution.",
    type: "boolean",
  })
  @Type(() => Boolean)
  @Expose()
  readonly isReference!: boolean;

  @ApiProperty()
  @Expose()
  readonly studentId!: number;

  @ApiProperty()
  @Expose()
  readonly sessionId!: number;

  @ApiProperty()
  @Expose()
  readonly taskId!: number;

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;

  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The base64 encoded solution hash.",
  })
  @Transform(
    ({ obj: { solutionHash } }: { obj: StudentSolutionWithoutData }) =>
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
    data: StudentSolutionWithoutData,
  ): ExistingStudentSolutionDto {
    return plainToInstance(ExistingStudentSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { ReferenceSolutionId } from "src/api/solutions/dto/existing-reference-solution.dto";
import { ExistingSolutionTestDto } from "src/api/solutions/dto/existing-solution-test.dto";
import { IsDate, IsOptional } from "class-validator";
import { TaskWithReferenceSolutions } from "../tasks.service";

type Input = TaskWithReferenceSolutions["referenceSolutions"][0];

export class TaskReferenceSolutionDto
  implements Modify<Input, { solution: string }>
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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;

  @ApiProperty({
    description: "The solution's mime type.",
  })
  @Type(() => String)
  @Expose()
  @Transform(
    ({
      obj: {
        solution: { mimeType },
      },
    }: {
      obj: Input;
    }) => mimeType,
    {
      toClassOnly: true,
    },
  )
  readonly mimeType!: string;

  @ApiProperty({
    description: "The associated solution encoded in base64.",
  })
  @Type(() => String)
  @Expose()
  @Transform(
    ({
      obj: {
        solution: { data },
      },
    }: {
      obj: Input;
    }) => Buffer.from(data).toString("base64"),
    {
      toClassOnly: true,
    },
  )
  readonly solution!: string;

  @ApiProperty({
    name: "tests",
    description: "The tests for the reference solution.",
    type: [ExistingSolutionTestDto],
  })
  @Transform(
    ({ value }: { value: Input["tests"] }) =>
      value?.map((test) =>
        plainToInstance(ExistingSolutionTestDto, test, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly tests!: ExistingSolutionTestDto[];

  static fromQueryResult(data: Input): TaskReferenceSolutionDto {
    return plainToInstance(TaskReferenceSolutionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

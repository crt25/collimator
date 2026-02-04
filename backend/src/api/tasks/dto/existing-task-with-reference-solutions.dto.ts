import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { TaskWithReferenceSolutions } from "../tasks.service";
import { ExistingTaskDto } from "./existing-task.dto";
import { TaskReferenceSolutionDto } from "./task-reference-solution.dto";

export type TaskId = number;

export type TaskWithReferenceSolutionsAndInUse = TaskWithReferenceSolutions & {
  isInUse: boolean;
};

export class ExistingTaskWithReferenceSolutionsDto
  extends ExistingTaskDto
  implements
    Modify<
      TaskWithReferenceSolutionsAndInUse,
      { referenceSolutions: TaskReferenceSolutionDto[] }
    >
{
  @ApiProperty({
    description: "The list of reference solutions.",
    type: [TaskReferenceSolutionDto],
  })
  @Transform(
    ({ value }: { value: TaskWithReferenceSolutions["referenceSolutions"] }) =>
      value.map((solution) =>
        plainToInstance(TaskReferenceSolutionDto, solution, {
          excludeExtraneousValues: true,
        }),
      ),
    { toClassOnly: true },
  )
  @Expose()
  readonly referenceSolutions!: TaskReferenceSolutionDto[];

  @ApiProperty({
    description:
      "Whether the task is in use by one or more classes with students.",
    example: false,
  })
  @Expose()
  readonly isInUse!: boolean;

  static fromQueryResult(
    data: TaskWithReferenceSolutionsAndInUse,
  ): ExistingTaskWithReferenceSolutionsDto {
    return plainToInstance(ExistingTaskWithReferenceSolutionsDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

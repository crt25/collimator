import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { TaskWithReferenceSolutions } from "../tasks.service";
import { ExistingTaskDto, TaskWithoutDataAndInUse } from "./existing-task.dto";
import { TaskReferenceSolutionDto } from "./task-reference-solution.dto";

export type TaskId = number;

export type TaskWithReferenceSolutionsAndInUse = TaskWithReferenceSolutions &
  Pick<TaskWithoutDataAndInUse, "isInUse">;

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

  static fromQueryResult(
    data: TaskWithReferenceSolutionsAndInUse,
  ): ExistingTaskWithReferenceSolutionsDto {
    return plainToInstance(ExistingTaskWithReferenceSolutionsDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

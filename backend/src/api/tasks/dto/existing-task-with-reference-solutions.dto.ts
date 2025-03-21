import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { Modify } from "src/utilities/modify";
import { TaskWithReferenceSolutions } from "../tasks.service";
import { ExistingTaskDto } from "./existing-task.dto";
import { TaskReferenceSolutionDto } from "./task-reference-solution.dto";

export type TaskId = number;

export class ExistingTaskWithReferenceSolutionsDto
  extends ExistingTaskDto
  implements
    Modify<
      TaskWithReferenceSolutions,
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
    data: TaskWithReferenceSolutions,
  ): ExistingTaskWithReferenceSolutionsDto {
    return plainToInstance(ExistingTaskWithReferenceSolutionsDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

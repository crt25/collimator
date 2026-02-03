import { ExistingTaskWithReferenceSolutionsDto } from "../../generated/models";
import { fromDtos } from "../../hooks/helpers";
import { ClassProperties } from "../class-properties";
import { ExistingTask } from "./existing-task";
import { TaskReferenceSolution } from "./task-reference-solution";

export class ExistingTaskWithReferenceSolutions extends ExistingTask {
  readonly referenceSolutions: TaskReferenceSolution[];
  readonly isInUse: boolean;

  protected constructor({
    referenceSolutions,
    isInUse,
    ...rest
  }: ClassProperties<ExistingTaskWithReferenceSolutions>) {
    super(rest);

    this.referenceSolutions = referenceSolutions;
    this.isInUse = isInUse;
  }

  static fromDto(
    dto: ExistingTaskWithReferenceSolutionsDto,
  ): ExistingTaskWithReferenceSolutions {
    return new ExistingTaskWithReferenceSolutions({
      ...dto,
      referenceSolutions: fromDtos(
        TaskReferenceSolution,
        dto.referenceSolutions,
      ),
    });
  }
}

import { plainToInstance } from "class-transformer";
import { ExistingTaskDto, TaskWithoutDataAndInUse } from "./existing-task.dto";

export class DeletedTaskDto extends ExistingTaskDto {
  static fromQueryResult(data: TaskWithoutDataAndInUse): DeletedTaskDto {
    return plainToInstance(DeletedTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

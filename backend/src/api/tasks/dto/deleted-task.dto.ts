import { ExistingTaskDto, ExistingTaskWithoutData } from "./existing-task.dto";
import { plainToInstance } from "class-transformer";

export class DeletedTaskDto extends ExistingTaskDto {
  static fromQueryResult(data: ExistingTaskWithoutData): DeletedTaskDto {
    return plainToInstance(DeletedTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

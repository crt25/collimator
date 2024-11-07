import { ExistingTaskDto } from "./existing-task.dto";
import { plainToInstance } from "class-transformer";
import { TaskWithoutData } from "../tasks.service";

export class DeletedTaskDto extends ExistingTaskDto {
  static fromQueryResult(data: TaskWithoutData): DeletedTaskDto {
    return plainToInstance(DeletedTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

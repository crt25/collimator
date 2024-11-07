import { ExistingTaskDto } from "./existing-task.dto";
import { Task } from "@prisma/client";
import { plainToInstance } from "class-transformer";

export class DeletedTaskDto extends ExistingTaskDto {
  static fromQueryResult(data: Task): DeletedTaskDto {
    return plainToInstance(DeletedTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

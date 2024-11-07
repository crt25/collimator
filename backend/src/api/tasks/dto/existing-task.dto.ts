import { ApiProperty } from "@nestjs/swagger";
import { Task } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";
import { CreateTaskDto } from "./create-task.dto";

export type TaskId = number;

export type ExistingTaskWithoutData = Omit<Task, "data" | "mimeType">;

export class ExistingTaskDto
  extends CreateTaskDto
  implements ExistingTaskWithoutData
{
  @ApiProperty({
    example: 318,
    description: "The task's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: TaskId;

  static fromQueryResult(data: ExistingTaskWithoutData): ExistingTaskDto {
    return plainToInstance(ExistingTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

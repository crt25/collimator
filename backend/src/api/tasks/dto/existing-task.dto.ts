import { ApiProperty } from "@nestjs/swagger";
import { Task } from "@prisma/client";
import { Exclude, Expose, plainToInstance } from "class-transformer";
import { CreateTaskDto } from "./create-task.dto";

export type TaskId = number;

export class ExistingTaskDto
  extends CreateTaskDto
  implements Omit<Task, "data">
{
  @ApiProperty({
    example: 318,
    description: "The task's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: TaskId;

  @Exclude()
  readonly mimeType!: string;

  @Exclude()
  readonly data!: Buffer;

  static fromQueryResult(data: Task): ExistingTaskDto {
    return plainToInstance(ExistingTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

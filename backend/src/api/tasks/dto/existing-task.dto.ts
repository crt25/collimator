import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance } from "class-transformer";
import { CreateTaskDto } from "./create-task.dto";
import { TaskWithoutData } from "../tasks.service";

export type TaskId = number;

export class ExistingTaskDto extends CreateTaskDto implements TaskWithoutData {
  @ApiProperty({
    example: 318,
    description: "The task's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: TaskId;

  @Exclude()
  readonly mimeType!: string;

  static fromQueryResult(data: TaskWithoutData): ExistingTaskDto {
    return plainToInstance(ExistingTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

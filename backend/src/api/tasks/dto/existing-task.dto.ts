import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance } from "class-transformer";
import { TaskWithoutData } from "../tasks.service";
import { TaskDto } from "./task.dto";

export type TaskId = number;

export class ExistingTaskDto extends TaskDto implements TaskWithoutData {
  @ApiProperty({
    example: 318,
    description: "The task's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: TaskId;

  @ApiProperty({
    example: 1,
    description: "The user's unique identifier, a positive integer.",
  })
  @Expose()
  readonly creatorId!: number;

  @Exclude()
  readonly mimeType!: string;

  static fromQueryResult(data: TaskWithoutData): ExistingTaskDto {
    return plainToInstance(ExistingTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

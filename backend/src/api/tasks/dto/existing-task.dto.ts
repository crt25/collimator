import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance, Type } from "class-transformer";
import { IsBoolean, IsDate, IsOptional } from "class-validator";
import { TaskWithoutData } from "../tasks.service";
import { TaskDto } from "./task.dto";

export type TaskId = number;

export type TaskWithoutDataAndInUse = TaskWithoutData & { isInUse: boolean };

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

  @ApiProperty({
    description:
      "Whether the task is public and visible to all teachers/admins.",
    example: false,
  })
  @IsBoolean()
  @Expose()
  readonly isPublic!: boolean;

  @Exclude()
  readonly mimeType!: string;

  @ApiProperty({
    description:
      "Whether the task is in use by one or more classes with students.",
    example: false,
  })
  @Expose()
  readonly isInUse!: boolean;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;

  static fromQueryResult(data: TaskWithoutData): ExistingTaskDto {
    return plainToInstance(ExistingTaskDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

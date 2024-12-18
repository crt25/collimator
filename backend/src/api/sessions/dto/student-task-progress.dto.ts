import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";
import { IsEnum } from "class-validator";
import { TaskProgress } from "../task-progress";

export class StudentTaskProgressDto {
  @ApiProperty({
    example: 1,
    description: "The id of the task.",
  })
  @Expose()
  readonly id!: number;

  @IsEnum(TaskProgress)
  @ApiProperty({
    example: TaskProgress.opened,
    description: "The task status",
    enumName: "TaskProgress",
    enum: Object.keys(TaskProgress),
  })
  @Expose()
  readonly taskProgress!: TaskProgress;

  static fromQueryResult(data: StudentTaskProgressDto): StudentTaskProgressDto {
    return plainToInstance(StudentTaskProgressDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

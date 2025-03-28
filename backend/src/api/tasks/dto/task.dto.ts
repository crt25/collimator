import { ApiProperty } from "@nestjs/swagger";
import { TaskType } from "@prisma/client";
import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { Expose } from "class-transformer";

export class TaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Expose()
  readonly description!: string;

  @IsEnum(TaskType)
  @IsNotEmpty()
  @ApiProperty({
    example: TaskType.SCRATCH,
    description: `The task's type.`,
    enumName: "TaskType",
    enum: Object.keys(TaskType),
  })
  @Expose()
  readonly type!: TaskType;
}

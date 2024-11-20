import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { TaskType } from "@prisma/client";

export class UpdateTaskDto {
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

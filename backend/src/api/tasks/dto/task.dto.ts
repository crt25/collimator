import { ApiProperty } from "@nestjs/swagger";
import { TaskType } from "@prisma/client";
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  MaxLength,
  MinLength,
} from "class-validator";
import { Expose } from "class-transformer";

export class TaskDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(200)
  @ApiProperty()
  @Expose()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
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

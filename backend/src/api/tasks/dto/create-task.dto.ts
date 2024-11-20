import { ApiProperty } from "@nestjs/swagger";
import { TaskType } from "@prisma/client";
import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { Expose } from "class-transformer";

export class CreateTaskDto {
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

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Task file",
    format: "binary",
    type: "string",
  })
  readonly file!: Express.Multer.File;
}

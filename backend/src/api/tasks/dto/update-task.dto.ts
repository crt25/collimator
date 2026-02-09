import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform, Type } from "class-transformer";
import { TaskType } from "@prisma/client";
import { UpdateReferenceSolutionDto } from "./update-reference-solution.dto";

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

  @ApiProperty({
    description:
      "Whether the task is public and visible to all teachers/admins.",
    example: false,
  })
  @Transform(({ value }) =>
    value === undefined ? undefined : value === "true" || value === true,
  )
  @IsBoolean()
  @Expose()
  readonly isPublic!: boolean;

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Task file",
    format: "binary",
    type: "string",
  })
  readonly taskFile!: Express.Multer.File;

  @ApiProperty({
    description: "Reference solution files",
    format: "binary",
    type: "string",
    isArray: true,
  })
  readonly referenceSolutionsFiles!: Express.Multer.File[];

  @Type(() => UpdateReferenceSolutionDto)
  @IsArray()
  @ApiProperty({
    description: "The reference solutions for this task.",
    type: [UpdateReferenceSolutionDto],
  })
  readonly referenceSolutions!: UpdateReferenceSolutionDto[];
}

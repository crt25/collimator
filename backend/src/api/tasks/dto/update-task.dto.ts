import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { TaskType } from "@prisma/client";
import { UpdateReferenceSolutionDto } from "./update-reference-solution.dto";

export class UpdateTaskDto {
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

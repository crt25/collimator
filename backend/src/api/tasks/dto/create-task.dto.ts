import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean } from "class-validator";
import { Expose, Transform, Type } from "class-transformer";
import { CreateReferenceSolutionDto } from "./create-reference-solution.dto";
import { TaskDto } from "./task.dto";

export class CreateTaskDto extends TaskDto {
  @ApiProperty({
    description:
      "Whether the task is public and visible to all teachers/admins.",
    example: false,
  })
  @Transform(({ value }) => value === "true" || value === true)
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

  @Type(() => CreateReferenceSolutionDto)
  @IsArray()
  @ApiProperty({
    description: "The reference solutions for this task.",
    type: [CreateReferenceSolutionDto],
  })
  readonly referenceSolutions!: CreateReferenceSolutionDto[];
}

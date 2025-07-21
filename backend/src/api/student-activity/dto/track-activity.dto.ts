import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { StudentActivityType } from "@prisma/client";
import { TrackAppStudentActivityDto } from "./track-app-activity.dto";

export class TrackStudentActivityDto {
  // @Type converts the input to the given type - necessary because this may be submitted as part of a multipart/form-data

  @Type(() => String)
  @IsEnum(StudentActivityType)
  @IsNotEmpty()
  @ApiProperty({
    example: StudentActivityType.TASK_RUN_SOLUTION,
    description: "The type of the activity.",
    enumName: "StudentActivityType",
    enum: Object.keys(StudentActivityType),
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly type!: StudentActivityType;

  @Type(() => Number)
  @ApiProperty({
    example: "42",
    description:
      "The identifier of the session in which the activity occurred.",
  })
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  readonly sessionId!: number;

  @Type(() => Number)
  @ApiProperty({
    example: "42",
    description: "The identifier of the task related to the activity.",
  })
  @IsInt()
  @IsNotEmpty()
  @ApiProperty()
  readonly taskId!: number;

  @Type(() => TrackAppStudentActivityDto)
  @ApiProperty({
    description:
      "Optional app activity object for this activity. Can only be set if the type is set to app activity..",
    type: TrackAppStudentActivityDto,
    nullable: true,
  })
  readonly appActivity!: TrackAppStudentActivityDto | null;

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "The solution file",
    format: "binary",
    type: "string",
  })
  readonly solution!: Express.Multer.File;
}

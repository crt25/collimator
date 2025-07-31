import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt, IsEnum, IsDate } from "class-validator";
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
  readonly type!: StudentActivityType;

  @Type(() => Number)
  @ApiProperty({
    example: "42",
    description:
      "The identifier of the session in which the activity occurred.",
  })
  @IsInt()
  @IsNotEmpty()
  readonly sessionId!: number;

  @Type(() => Number)
  @ApiProperty({
    example: "42",
    description: "The identifier of the task related to the activity.",
  })
  @IsInt()
  @IsNotEmpty()
  readonly taskId!: number;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    example: "2025-01-01T12:00:00Z",
    description: "The time the activity happened at.",
  })
  readonly happenedAt!: Date;

  @Type(() => TrackAppStudentActivityDto)
  @ApiProperty({
    description:
      "Optional app activity object for this activity. Can only be set if the type is set to app activity.",
    type: TrackAppStudentActivityDto,
    nullable: true,
  })
  readonly appActivity!: TrackAppStudentActivityDto | null;
}

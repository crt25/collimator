import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";
import { Type } from "class-transformer";
import { TrackAppStudentActivityDto } from "./track-app-activity.dto";
import { TrackStudentActivityDto } from "./track-activity.dto";

export class TrackStudentActivitiesDto {
  // @Type converts the input to the given type - necessary because this may be submitted as part of a multipart/form-data

  @Type(() => TrackAppStudentActivityDto)
  @IsArray()
  @ApiProperty({
    description:
      "Optional app activity object for this activity. Can only be set if the type is set to app activity.",
    type: [TrackStudentActivityDto],
    nullable: true,
  })
  readonly activities!: TrackStudentActivityDto[];

  // The following property is used for Swagger documentation purposes.
  @ApiProperty({
    description: "Reference solution files",
    format: "binary",
    type: "string",
    isArray: true,
  })
  readonly solutions!: Express.Multer.File[];
}

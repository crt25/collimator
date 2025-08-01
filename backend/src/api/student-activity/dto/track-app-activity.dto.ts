import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class TrackAppStudentActivityDto {
  // @Type converts the input to the given type - necessary because this may be submitted as part of a multipart/form-data

  @Type(() => String)
  @ApiProperty({
    example: "my-app-activity-type",
    description: "The application-internal type of the activity.",
  })
  @IsString()
  @IsNotEmpty()
  readonly type!: string;

  @Type(() => String)
  @ApiProperty({
    example: "dGhpcyBpcyBhbiBleGFtcGxlIHZhbHVl",
    description: "The binary app activity data encoded in base64.",
  })
  @IsString()
  @IsNotEmpty()
  readonly data!: string;
}

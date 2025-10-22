import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
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
    example: "{key: 'value'}",
    description: "The app activity data stored as a JSON object.",
  })
  @IsString()
  @IsNotEmpty()
  readonly data!: Prisma.InputJsonValue;
}

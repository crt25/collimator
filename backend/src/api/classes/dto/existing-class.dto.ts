import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";
import { CreateClassDto } from "./create-class.dto";

export type ClassId = number;

export class ExistingClassDto extends CreateClassDto implements Class {
  @ApiProperty({
    example: 318,
    description: "The class's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: ClassId;

  static fromQueryResult(data: Class): ExistingClassDto {
    return plainToInstance(ExistingClassDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

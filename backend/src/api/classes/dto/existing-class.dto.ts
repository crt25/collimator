import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { Expose, plainToInstance } from "class-transformer";
import { IsDate } from "class-validator";
import { CreateClassDto } from "./create-class.dto";

export type ClassId = number;

export class ExistingClassDto extends CreateClassDto implements Class {
  @ApiProperty({
    example: 318,
    description: "The class's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: ClassId;

  @IsDate()
  @ApiProperty({ nullable: true })
  @Expose()
  readonly deletedAt!: Date | null;

  static fromQueryResult(data: Class): ExistingClassDto {
    return plainToInstance(ExistingClassDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

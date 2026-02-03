import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { Expose, plainToInstance, Type } from "class-transformer";
import { IsDate, IsOptional } from "class-validator";
import { ClassId } from "./existing-class.dto";
import { ClassTeacherDto } from "./class-teacher.dto";

export class ExistingClassWithTeacherDto implements Omit<Class, "teacherId"> {
  @ApiProperty({
    example: 318,
    description: "The class's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: ClassId;

  @ApiProperty()
  @Expose()
  readonly name!: string;

  @ApiProperty({
    description: "The teacher of the class.",
  })
  @Type(() => ClassTeacherDto)
  @Expose()
  readonly teacher!: ClassTeacherDto;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;

  static fromQueryResult(data: Class): ExistingClassWithTeacherDto {
    return plainToInstance(ExistingClassWithTeacherDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

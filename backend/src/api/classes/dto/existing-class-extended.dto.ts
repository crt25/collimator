import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { ExistingClassWithTeacherDto } from "./existing-class-with-teacher.dto";

type SessionList = { id: number }[];

export class ExistingClassExtendedDto extends ExistingClassWithTeacherDto {
  @ApiProperty({
    description: "The list of session IDs.",
    type: [Number],
    example: [1, 2],
  })
  @Transform(
    ({ value }: { value: SessionList }) =>
      value?.map((s: { id: number }) => s.id) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly sessions!: number[];

  @ApiProperty({
    name: "studentCount",
    description: "The number of students in the class.",
    example: 25,
  })
  @Transform(({ value, obj }) => value ?? obj._count?.students ?? 0, {
    toClassOnly: true,
  })
  @Expose()
  readonly studentCount!: number;

  static fromQueryResult(data: Class): ExistingClassExtendedDto {
    return plainToInstance(ExistingClassExtendedDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

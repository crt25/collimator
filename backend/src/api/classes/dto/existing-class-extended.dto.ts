import { ApiProperty } from "@nestjs/swagger";
import { Class } from "@prisma/client";
import { Expose, plainToInstance, Transform } from "class-transformer";
import { ExistingClassWithTeacherDto } from "./existing-class-with-teacher.dto";
import { ClassStudentDto } from "./class-student.dto";

type SessionList = { id: number }[];
type StudentList = { id: number; pseudonym: string }[];

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
    name: "students",
    description: "The students in the class.",
    type: [ClassStudentDto],
  })
  @Transform(
    ({ value }: { value: StudentList }) =>
      value?.map((student) =>
        plainToInstance(ClassStudentDto, student, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly students!: ClassStudentDto[];

  static fromQueryResult(data: Class): ExistingClassExtendedDto {
    return plainToInstance(ExistingClassExtendedDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

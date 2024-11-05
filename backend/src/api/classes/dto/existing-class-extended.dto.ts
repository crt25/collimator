import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
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
  readonly sessions!: number[];

  @ApiProperty({
    name: "studentCount",
    description: "The number of students in the class.",
    type: Number,
    example: 25,
  })
  @Expose({ name: "studentCount", toPlainOnly: true })
  // Receive _count { students: number }, turn it into studentCount: number
  @Transform(({ value }) => value?.students ?? 0, { toClassOnly: true })
  readonly _count!: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { Expose, plainToInstance } from "class-transformer";
import { StudentTaskProgressDto } from "./student-task-progress.dto";

export class StudentSessionProgressDto {
  @ApiProperty({
    example: 1,
    description: "The id of the session.",
  })
  @Expose()
  readonly id!: number;

  @ApiProperty({
    description: "The user's progress on the session's tasks.",
    type: [StudentTaskProgressDto],
  })
  @Expose()
  readonly taskProgress!: StudentTaskProgressDto[];

  static fromQueryResult(
    data: StudentSessionProgressDto,
  ): StudentSessionProgressDto {
    return plainToInstance(StudentSessionProgressDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

import { ApiProperty } from "@nestjs/swagger";
import { Session } from "@prisma/client";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { SessionClassDto } from "./session-class.dto";
import { SessionLessonDto } from "./session-lesson.dto";

export type SessionId = number;
type TaskList = { taskId: number }[];

export class ExistingSessionDto
  implements Omit<Session, "classId" | "basedOnLessonId">
{
  @ApiProperty({
    example: 318,
    description: "The session's unique identifier, a positive integer.",
  })
  @Expose()
  readonly id!: SessionId;

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  readonly createdAt!: Date;

  @ApiProperty()
  @Expose()
  readonly title!: string;

  @ApiProperty()
  @Expose()
  readonly description!: string;

  @ApiProperty({
    description: "The lesson from which this session was created.",
    type: SessionLessonDto,
  })
  @Type(() => SessionLessonDto)
  @Expose()
  readonly lesson!: SessionLessonDto;

  @ApiProperty({
    description: "The session's class.",
    type: SessionClassDto,
  })
  @Type(() => SessionClassDto)
  @Expose()
  readonly class?: SessionClassDto;

  @ApiProperty({
    description: "The list of task IDs.",
    type: [Number],
    example: [1, 2],
  })
  @Transform(
    ({ value }: { value: TaskList }) =>
      value?.map((s: { taskId: number }) => s.taskId) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly tasks!: number[];

  static fromQueryResult(data: Session): ExistingSessionDto {
    return plainToInstance(ExistingSessionDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

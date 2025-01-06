import { ApiProperty } from "@nestjs/swagger";
import { Session, SessionStatus } from "@prisma/client";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { IsEnum, IsNotEmpty } from "class-validator";
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

  @ApiProperty()
  @Expose()
  readonly isAnonymous!: boolean;

  @IsEnum(SessionStatus)
  @IsNotEmpty()
  @ApiProperty({
    example: SessionStatus.ONGOING,
    description: `The session's status.`,
    enumName: "SessionStatus",
    enum: Object.keys(SessionStatus),
  })
  @Expose()
  readonly status!: SessionStatus;

  @ApiProperty({
    description: "The lesson from which this session was created.",
    type: SessionLessonDto,
    nullable: true,
  })
  @Type(() => SessionLessonDto)
  @Expose()
  readonly lesson!: SessionLessonDto | null;

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

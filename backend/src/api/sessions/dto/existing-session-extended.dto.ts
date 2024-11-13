import { ApiProperty } from "@nestjs/swagger";
import { Session, SessionStatus } from "@prisma/client";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { SessionClassDto } from "./session-class.dto";
import { SessionLessonDto } from "./session-lesson.dto";
import { SessionTaskDto } from "./session-task.dto";
import { SessionId } from "./existing-session.dto";
import { IsEnum, IsNotEmpty } from "class-validator";

type TaskList = { task: { id: number; name: string } }[];

export class ExistingSessionExtendedDto
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
    description: "The corresponding lesson.",
    type: SessionLessonDto,
    nullable: true,
  })
  @Type(() => SessionLessonDto)
  @Expose()
  readonly lesson!: SessionLessonDto | null;

  @ApiProperty({
    description: "The session's class.",
    type: SessionClassDto,
  })
  @Type(() => SessionClassDto)
  @Expose()
  readonly class!: SessionClassDto;

  @ApiProperty({
    description: "The session's task.",
    type: [SessionTaskDto],
  })
  @Transform(
    ({ value }: { value: TaskList }) =>
      value?.map((s: { task: unknown }) =>
        plainToInstance(SessionTaskDto, s.task, {
          excludeExtraneousValues: true,
        }),
      ) ?? [],
    { toClassOnly: true },
  )
  @Expose()
  readonly tasks!: SessionTaskDto[];

  static fromQueryResult(data: Session): ExistingSessionExtendedDto {
    return plainToInstance(ExistingSessionExtendedDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

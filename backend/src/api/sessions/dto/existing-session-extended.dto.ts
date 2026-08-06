import { ApiProperty } from "@nestjs/swagger";
import { Session, SessionStatus } from "@prisma/client";
import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { SessionStudent } from "../sessions.service";
import { SessionClassDto } from "./session-class.dto";
import { SessionStudentDto } from "./session-student.dto";
import { SessionTaskDto } from "./session-task.dto";
import { SessionId } from "./existing-session.dto";

type TaskList = { task: { id: number; name: string } }[];
export type SessionWithStudentIndicator = Session & {
  hasStudents: boolean;
  students: SessionStudent[];
};

export class ExistingSessionExtendedDto implements Omit<Session, "classId"> {
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

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  @ApiProperty({ type: Date, nullable: true, required: false })
  @Expose()
  readonly deletedAt!: Date | null;

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
    description: "The session's class.",
    type: SessionClassDto,
  })
  @Type(() => SessionClassDto)
  @Expose()
  readonly class!: SessionClassDto;

  @ApiProperty({
    description: "The session's tasks.",
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

  @ApiProperty({
    description: "Indicates whether the session has any students.",
    type: Boolean,
  })
  @Expose()
  readonly hasStudents!: boolean;

  @ApiProperty({
    description:
      "The students taking part in this session, including those that have" +
      " not started any task yet: for an anonymous session everyone who" +
      " joined it (without a pseudonym), for a class-roster session the" +
      " enrolled students.",
    type: [SessionStudentDto],
  })
  @Type(() => SessionStudentDto)
  @Expose()
  readonly students!: SessionStudentDto[];

  static fromQueryResult(
    data: SessionWithStudentIndicator,
  ): ExistingSessionExtendedDto {
    return plainToInstance(ExistingSessionExtendedDto, data, {
      excludeExtraneousValues: true,
    });
  }
}

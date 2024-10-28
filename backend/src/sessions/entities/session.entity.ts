import { ApiProperty } from "@nestjs/swagger";
import { Session } from "@prisma/client";
import { UserEntity } from "src/users/entities/user.entity";
import { IsOptional } from "class-validator";

export class SessionEntity implements Session {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string;

  @ApiProperty()
  readonly teacherId: number;

  @IsOptional()
  @ApiProperty()
  readonly teacher?: UserEntity;

  constructor(entity: Session & { teacher?: UserEntity }) {
    this.id = entity.id;
    this.name = entity.name;
    this.teacherId = entity.teacherId;
    this.teacher = entity.teacher;
  }
}

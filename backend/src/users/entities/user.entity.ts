import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { Exclude } from "class-transformer";

export class UserEntity implements User {
  @ApiProperty()
  readonly id: number;

  @ApiProperty()
  readonly name: string | null;

  @Exclude()
  readonly email: string;

  constructor(entity: User) {
    this.id = entity.id;
    this.name = entity.name;
    this.email = entity.email;
  }
}

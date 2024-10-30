import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { CreateUserDto } from "./create-user.dto";

export type UserId = number;

export class ExistingUserDto extends CreateUserDto implements User {
  @ApiProperty({
    example: 318,
    description: "The user unique identifier, a positive integer.",
  })
  readonly id!: UserId;
}

import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsNumber } from "class-validator";

export type UserId = number;

export class ExistingUserDto extends CreateUserDto implements User {
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
    maxDecimalPlaces: 0,
  })
  @IsNotEmpty()
  @ApiProperty({
    example: 318,
    description: "The user unique identifier, a positive integer.",
  })
  readonly id!: UserId;
}

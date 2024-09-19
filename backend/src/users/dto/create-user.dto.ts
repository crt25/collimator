import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email!: string;

  toInput(): Prisma.UserCreateInput {
    return {
      name: this.name,
      email: this.email,
    };
  }
}

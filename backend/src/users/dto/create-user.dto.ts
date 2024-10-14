import { ApiProperty } from "@nestjs/swagger";
import { Prisma, UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email!: string;

  @IsEnum(UserType)
  readonly type!: UserType;

  toInput(): Prisma.UserCreateInput {
    return {
      name: this.name,
      email: this.email,
      type: this.type,
    };
  }
}

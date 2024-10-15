import { ApiProperty } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsEmail, IsNotEmpty, IsString, IsEnum } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name!: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email!: string;

  @IsEnum(["student", "teacher"])
  @IsNotEmpty()
  @ApiProperty()
  readonly role!: "student" | "teacher";

  toInput(): Prisma.UserCreateInput {
    const roleObj =
      this.role === "student"
        ? { Student: { create: {} } }
        : { Teacher: { create: {} } };

    return {
      ...roleObj,
      name: this.name,
      email: this.email,
    };
  }
}
